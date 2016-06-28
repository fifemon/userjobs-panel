import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';

function background_style(value, limit) {
    var bg;
    if (value > limit) {
        bg=' style="background-color:rgba(245, 54, 54, 0.9);color: white"';
    } else if (value > limit*0.9) {
        bg=' style="background-color:rgba(237, 129, 40, 0.890196);color: black"';
    } else {
        bg='';
    }
    return bg;
}

export class UserJobsCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope, templateSrv) {
    super($scope, $injector);
    this.$rootScope = $rootScope;
    this.templateSrv = templateSrv;

    var panelDefaults = {
        index: "",
        query: "*",
        userQuery: "",
        mode: "Completed", // "Active","Completed"
        showIdle: true,
        showRunning: true,
        showHeld: true,
        size: 100,
        scroll: false
    };

    this.data = [];
    this.docs = 0;
    this.docsMissing = 0;
    this.docsTotal = 0;
    this.rowCount = 0;

    _.defaults(this.panel, panelDefaults);

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }


  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/fifemon-userjobs-panel/editor.html', 2);
  }

  issueQueries(datasource) {
      this.updateTimeRange();
      this.datasource=datasource;
      return datasource._post(this.panel.index+'/'+'_search',this.get_clusters_query()).then(function(res) {
          return {data: res};
      });
  }

  onDataReceived(data) {
      if (data) {
          this.data = data.aggregations.cluster.buckets;
          this.docsMissing = data.aggregations.cluster.sum_other_doc_count;
          this.docsTotal = data.hits.total;
          this.docs = this.docsTotal - this.docsMissing;
          this.rowCount = this.data.length;
      } else {
          this.data = [];
      }
      this.render(this.data);
  }

  render() {
      return super.render(this.data);
  }

  link(scope, elem, attrs, ctrl) {
      var data;
      var panel = ctrl.panel;
      var pageCount = 0;

      function getTableHeight() {
          var panelHeight = ctrl.height;
          /*if (pageCount > 1) {
              panelHeight -= 26;
          }*/
          return (panelHeight - 31) + 'px';
      }

      function renderPanel() {
          var root = elem.find('.table-panel-scroll');
          root.css({'max-height': panel.scroll ? getTableHeight() : ''});

          var tbody = elem.find('tbody');
          renderTable(tbody);
      }

      function renderTable(tbody) {
          tbody.empty();
          var html = '';
          for (var i = 0; i < data.length; i++) {
              html += renderActiveRow(data[i]);
          }
          tbody.html(html);
      }

      function renderActiveRow(data) {
          var schedd = data.cmd.hits.hits[0]._source.schedd;
          var cmd = data.cmd.hits.hits[0]._source.Cmd.split('/').pop();
          var bg_hold = background_style(data.status.buckets.held.doc_count*100,1.0);
          var request_mem = data.request_mem.value*1;
          var max_mem = data.max_mem.value / 1024;
          var bg_mem=background_style(max_mem,request_mem);
          var request_disk = data.request_disk.value / 1024;
          var max_disk = data.max_disk.value / 1024;
          var bg_disk=background_style(max_disk,request_disk);
          var max_cputime = data.max_cputime.value / 3600;
          var max_walltime = data.max_walltime.value / 3600;
          var efficiency="----";
          if (max_walltime > 0) {
              efficiency = (max_cputime/max_walltime*100).toFixed(1)+'%';
          }
          var request_time = data.request_walltime.value / 3600;
          var bg_time=background_style(max_walltime,request_time);
          var html = '<tr>'+
              '<td rowspan="2"><a style="text-decoration:underline;" href="dashboard/db/job-cluster-summary?var-cluster='+data['key']+'&var-schedd='+schedd+'&from='+data.submit_date.value+'&to='+ctrl.rangeRaw.to+'">'+data['key']+'@'+schedd+'</a></td>';
          if (panel.mode === 'Active') {
              html += '<td rowspan="2">'+data.status.buckets.idle.doc_count+'</td>'+
              '<td rowspan="2">'+data.status.buckets.running.doc_count+'</td>'+
              '<td rowspan="2"' + bg_hold + '>'+data.status.buckets.held.doc_count+'</td>';
          }
          html += '<td>'+data.submit_date.value_as_string+'</td>'+
              '<td' + bg_mem + '>' + max_mem.toFixed(0) + ' / ' + request_mem.toFixed(0) +'</td>'+
              '<td' + bg_disk + '>' + max_disk.toFixed(0) + ' / ' + request_disk.toFixed(0) +'</td>'+
              '<td' + bg_time + '>' + max_walltime.toFixed(0) + ' / ' + request_time.toFixed(0) +'</td>'+
              //'<td>'+ max_cputime.toFixed(2) +' hr</td>'+
              '<td>'+ efficiency +'</td>'+
              '<td>'+data.max_restarts.value+'&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
              '</tr><tr><td colspan="6" class="job-command">'+cmd+'</td>'+
              '</tr>';
          return html;
      }


      ctrl.events.on('render', function(renderData) {
          data = renderData || data;
          if (data) {
              renderPanel();
          }
          ctrl.renderingCompleted();
      });
  }

  get_clusters_query() {
      var q = this.templateSrv.replace(this.panel.query, this.panel.scopedVars);
      if (this.panel.userQuery !== '') {
          q += ' AND ' + this.panel.userQuery;
      }

      var from = this.rangeRaw.from;
      var to = this.rangeRaw.to;
      // time range hack; really should have separate indices for active and completed jobs
      if (this.panel.mode === 'Active') {
          from = 'now-10m';
          to = 'now';
      } else if (this.panel.mode === 'Completed' && to === 'now') {
          to = 'now-10m';
      }

      var data = {
          "size": 0,
          "query": {
              "filtered": {
                  "query": {
                      "query_string": { "query": q }
                  },
                  "filter": {
                      "range": { "timestamp": { "gte": from, "lte": to }}
                  }
              }
          },
          "aggs": {
              "cluster": {
                  "terms": {
                      "field": "cluster",
                      "size": this.panel.size,
                      "order" : { "submit_date" : "asc" }
                  },
                  "aggs": {
                      "max_mem": {
                          "max": {
                              "field": "ResidentSetSize_RAW"
                          }
                      },
                      "request_mem": {
                          "min": {
                              "field": "RequestMemory"
                          }
                      },
                      "max_disk": {
                          "max": {
                              "field": "DiskUsage_RAW"
                          }
                      },
                      "request_disk": {
                          "min": {
                              "field": "RequestDisk"
                          }
                      },
                      "submit_date": {
                          "min": {
                              "field": "submit_date"
                          }
                      },
                      "max_restarts": {
                          "max": {
                              "field": "NumJobStarts"
                          }
                      },
                      "max_cputime": {
                          "max": {
                              "field": "RemoteUserCpu"
                          }
                      },
                      "max_walltime": {
                          "max": {
                              "field": "walltime"
                          }
                      },
                      "request_walltime": {
                          "max": {
                              "field": "JOB_EXPECTED_MAX_LIFETIME"
                          }
                      },
                      "cmd": {
                          "top_hits": {
                              "size": 1,
                              "_source": {
                                  "include": ["Cmd", "schedd"]
                              }
                          }
                      },
                      "status": {
                          "filters": {
                              "filters": {
                                  "idle": { "term": { "status": 1 }},
                                  "running": { "term": { "status": 2 }},
                                  "cancelled": { "term": { "status": 3 }},
                                  "complete": { "term": { "status": 4 }},
                                  "held": { "term": { "status": 5 }}
                              }
                          }
                      }
                  }
              }
          }
      };
      return data;
  }

}

UserJobsCtrl.templateUrl = 'module.html';

export {
  UserJobsCtrl as PanelCtrl
};

