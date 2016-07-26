'use strict';

System.register(['app/plugins/sdk', 'lodash', 'moment'], function (_export, _context) {
    "use strict";

    var MetricsPanelCtrl, _, moment, _createClass, _get, UserJobsCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function background_style(value, limit) {
        var bg;
        if (value > limit) {
            bg = ' style="background-color:rgba(245, 54, 54, 0.9);color: white"';
        } else if (value > limit * 0.9) {
            bg = ' style="background-color:rgba(237, 129, 40, 0.890196);color: black"';
        } else {
            bg = '';
        }
        return bg;
    }

    return {
        setters: [function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_moment) {
            moment = _moment.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _get = function get(object, property, receiver) {
                if (object === null) object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);

                if (desc === undefined) {
                    var parent = Object.getPrototypeOf(object);

                    if (parent === null) {
                        return undefined;
                    } else {
                        return get(parent, property, receiver);
                    }
                } else if ("value" in desc) {
                    return desc.value;
                } else {
                    var getter = desc.get;

                    if (getter === undefined) {
                        return undefined;
                    }

                    return getter.call(receiver);
                }
            };

            _export('PanelCtrl', _export('UserJobsCtrl', UserJobsCtrl = function (_MetricsPanelCtrl) {
                _inherits(UserJobsCtrl, _MetricsPanelCtrl);

                function UserJobsCtrl($scope, $injector, $rootScope, templateSrv) {
                    _classCallCheck(this, UserJobsCtrl);

                    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UserJobsCtrl).call(this, $scope, $injector));

                    _this.$rootScope = $rootScope;
                    _this.templateSrv = templateSrv;

                    var panelDefaults = {
                        index: "",
                        query: "*",
                        mode: "Active", // "Active","Completed"
                        size: 100,
                        scroll: false,
                        sortField: 'submit_date',
                        sortOrder: 'asc',
                        queries: [{ name: "-- custom --", query: "" }]
                    };
                    _.defaults(_this.panel, panelDefaults);

                    _this.data = [];
                    _this.docs = 0;
                    _this.docsMissing = 0;
                    _this.docsTotal = 0;
                    _this.rowCount = 0;
                    _this.filterQuery = { name: "all jobs", query: "" };
                    _this.customQuery = "";
                    _this.columns = [{ name: "Cluster", title: "Job Cluster ID",
                        field: "_term", modes: ['Active', 'Completed'] }, { name: "I", title: "# Idle Jobs",
                        field: "idle", modes: ['Active'] }, { name: "R", title: "# Running Jobs",
                        field: "running", modes: ['Active'] }, { name: "H", title: "# Held Jobs",
                        field: "held", modes: ['Active'] }, { name: "N", title: "# Jobs",
                        field: "doc_count", modes: ['Completed'] }, { name: "Submit Time", title: "Time job was sumbitted",
                        field: "submit_date", modes: ['Active', 'Completed'] }, { name: "End Time", title: "Time job was completed or cancelled",
                        field: "last_update", modes: ['Completed'] }, { name: "Memory (MB)", title: "Max used and requested memory",
                        field: "max_mem", modes: ['Active', 'Completed'] }, { name: "Disk (MB)", title: "Max used and requested disk",
                        field: "max_disk", modes: ['Active', 'Completed'] }, { name: "Time (hr)", title: "Max used and requested walltime",
                        field: "max_walltime", modes: ['Active', 'Completed'] }, { name: "Max Eff.", title: "Max CPU efficiency (CPU time / walltime)",
                        field: "max_efficiency", modes: ['Active', 'Completed'] }, { name: "Starts", title: "Max number of times a job has started",
                        field: "max_restarts", modes: ['Active', 'Completed'] }];

                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    return _this;
                }

                _createClass(UserJobsCtrl, [{
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('Options', 'public/plugins/fifemon-userjobs-panel/editor.html', 2);
                    }
                }, {
                    key: 'issueQueries',
                    value: function issueQueries(datasource) {
                        this.updateTimeRange();
                        this.datasource = datasource;
                        return datasource._post(this.panel.index + '/' + '_search', this.get_clusters_query()).then(function (res) {
                            return { data: res };
                        });
                    }
                }, {
                    key: 'onDataReceived',
                    value: function onDataReceived(data) {
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
                }, {
                    key: 'render',
                    value: function render() {
                        return _get(Object.getPrototypeOf(UserJobsCtrl.prototype), 'render', this).call(this, this.data);
                    }
                }, {
                    key: 'toggleSort',
                    value: function toggleSort(field) {
                        if (field === this.panel.sortField) {
                            this.panel.sortOrder = this.panel.sortOrder === 'asc' ? 'desc' : 'asc';
                        } else {
                            this.panel.sortField = field;
                            this.panel.sortOrder = 'asc';
                        }
                        this.refresh();
                    }
                }, {
                    key: 'addQuery',
                    value: function addQuery() {
                        var custom = this.panel.queries.pop();
                        this.panel.queries.push({ name: 'new query', query: '' });
                        this.panel.queries.push(custom);
                    }
                }, {
                    key: 'removeQuery',
                    value: function removeQuery(name) {
                        _.remove(this.panel.queries, { 'name': name });
                    }
                }, {
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        var data;
                        var panel = ctrl.panel;
                        var pageCount = 0;

                        function getTableHeight() {
                            var panelHeight = ctrl.height;
                            /*if (pageCount > 1) {
                                panelHeight -= 26;
                            }*/
                            return panelHeight - 31 + 'px';
                        }

                        function renderPanel() {
                            var root = elem.find('.table-panel-scroll');
                            root.css({ 'max-height': panel.scroll ? getTableHeight() : '' });

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
                            function formatDate(date) {
                                var d = moment(date.value_as_string);
                                if (ctrl.dashboard.timezone == 'utc') {
                                    d.utc();
                                }
                                return d.format('ddd MMM DD HH:mm ZZ');
                            }

                            var schedd = data.cmd.hits.hits[0]._source.schedd;
                            var cmd = data.cmd.hits.hits[0]._source.Cmd.split('/').pop();
                            var bg_hold = background_style(data.held.doc_count * 100, 1.0);
                            var request_mem = data.request_mem.value * 1;
                            var max_mem = data.max_mem.value / 1024;
                            var bg_mem = background_style(max_mem, request_mem);
                            var request_disk = data.request_disk.value / 1024;
                            var max_disk = data.max_disk.value / 1024;
                            var bg_disk = background_style(max_disk, request_disk);
                            var max_cputime = data.max_cputime.value / 3600;
                            var max_walltime = data.max_walltime.value / 3600;
                            var efficiency = "----";
                            if (max_walltime > 0) {
                                efficiency = (data.max_efficiency.value * 100).toFixed(1) + '%';
                            }
                            var request_time = data.request_walltime.value / 3600;
                            var bg_time = background_style(max_walltime, request_time);
                            var html = '<tr>' + '<td rowspan="2"><a style="text-decoration:underline;" href="dashboard/db/job-cluster-summary?var-cluster=' + data.key + '&var-schedd=' + schedd + '&from=' + data.submit_date.value + '&to=' + ctrl.rangeRaw.to + '">' + data.key + '@' + schedd + '</a></td>';
                            if (panel.mode === 'Active') {
                                html += '<td rowspan="2">' + data.idle.doc_count + '</td>' + '<td rowspan="2">' + data.running.doc_count + '</td>' + '<td rowspan="2"' + bg_hold + '>' + data.held.doc_count + '</td>';
                            } else if (panel.mode == 'Completed') {
                                html += '<td rowspan="2">' + data.doc_count + '</td>';
                            }
                            html += '<td>' + formatDate(data.submit_date) + '</td>';
                            if (panel.mode === 'Completed') {
                                html += '<td>' + formatDate(data.last_update) + '</td>';
                            }
                            html += '<td' + bg_mem + '>' + max_mem.toFixed(0) + ' / ' + request_mem.toFixed(0) + '</td>' + '<td' + bg_disk + '>' + max_disk.toFixed(0) + ' / ' + request_disk.toFixed(0) + '</td>' + '<td' + bg_time + '>' + max_walltime.toFixed(0) + ' / ' + request_time.toFixed(0) + '</td>' +
                            //'<td>'+ max_cputime.toFixed(2) +' hr</td>'+
                            '<td>' + efficiency + '</td>' + '<td>' + data.max_restarts.value + '&nbsp;&nbsp;&nbsp;&nbsp;</td>' + '</tr>';
                            if (panel.mode === 'Active') {
                                html += '<tr><td colspan="6" class="job-command">' + cmd + '</td></tr>';
                            } else if (panel.mode === 'Completed') {
                                html += '<tr><td colspan="7" class="job-command">' + cmd + '</td></tr>';
                            }
                            return html;
                        }

                        ctrl.events.on('render', function (renderData) {
                            data = renderData || data;
                            if (data) {
                                renderPanel();
                            }
                            ctrl.renderingCompleted();
                        });
                    }
                }, {
                    key: 'get_clusters_query',
                    value: function get_clusters_query() {
                        var q = this.templateSrv.replace(this.panel.query, this.panel.scopedVars);
                        if (this.filterQuery && this.filterQuery.name === '-- custom --') {
                            if (this.customQuery !== '') {
                                q += ' AND (' + this.customQuery + ')';
                            }
                        } else if (this.filterQuery && this.filterQuery.query !== '') {
                            q += ' AND (' + this.filterQuery.query + ')';
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

                        var sort = {};
                        sort[this.panel.sortField] = this.panel.sortOrder;

                        var data = {
                            "size": 0,
                            "query": {
                                "filtered": {
                                    "query": {
                                        "query_string": {
                                            "query": q,
                                            "lowercase_expanded_terms": false
                                        }
                                    },
                                    "filter": {
                                        "range": { "timestamp": { "gte": from, "lte": to } }
                                    }
                                }
                            },
                            "aggs": {
                                "cluster": {
                                    "terms": {
                                        "field": "cluster",
                                        "size": this.panel.size,
                                        "order": sort
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
                                        "last_update": {
                                            "max": {
                                                "field": "@timestamp"
                                            }
                                        },
                                        "max_restarts": {
                                            "max": {
                                                "field": "NumJobStarts"
                                            }
                                        },
                                        "max_efficiency": {
                                            "max": {
                                                "field": "efficiency"
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
                                        "idle": {
                                            "filter": { "term": { "status": 1 } }
                                        },
                                        "running": {
                                            "filter": { "term": { "status": 2 } }
                                        },
                                        "cancelled": {
                                            "filter": { "term": { "status": 3 } }
                                        },
                                        "complete": {
                                            "filter": { "term": { "status": 4 } }
                                        },
                                        "held": {
                                            "filter": { "term": { "status": 5 } }
                                        }
                                    }
                                }
                            }
                        };
                        return data;
                    }
                }]);

                return UserJobsCtrl;
            }(MetricsPanelCtrl)));

            _export('UserJobsCtrl', UserJobsCtrl);

            UserJobsCtrl.templateUrl = 'module.html';

            _export('PanelCtrl', UserJobsCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map
