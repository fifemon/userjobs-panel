'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series'], function (_export, _context) {
    "use strict";

    var MetricsPanelCtrl, _, kbn, TimeSeries, _createClass, _get, UserJobsCtrl;

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
        }, function (_appCoreUtilsKbn) {
            kbn = _appCoreUtilsKbn.default;
        }, function (_appCoreTime_series) {
            TimeSeries = _appCoreTime_series.default;
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

                function UserJobsCtrl($scope, $injector, $rootScope) {
                    _classCallCheck(this, UserJobsCtrl);

                    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UserJobsCtrl).call(this, $scope, $injector));

                    _this.$rootScope = $rootScope;

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

                    _.defaults(_this.panel, panelDefaults);

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
                            this.data = data['aggregations']['cluster']['buckets'];
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
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        var data;
                        var panel = ctrl.panel;
                        var pageCount = 0;

                        function renderPanel() {
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
                            var schedd = data['cmd']['hits']['hits'][0]['_source']['schedd'];
                            var cmd = data['cmd']['hits']['hits'][0]['_source']['Cmd'].split('/').pop();
                            var bg_hold = background_style(data['status']['buckets']['held']['doc_count'] * 100, 1.0);
                            var request_mem = data['request_mem']['value'] * 1;
                            var max_mem = data['max_mem']['value'] / 1024;
                            var bg_mem = background_style(max_mem, request_mem);
                            var request_disk = data['request_disk']['value'] / 1024;
                            var max_disk = data['max_disk']['value'] / 1024;
                            var bg_disk = background_style(max_disk, request_disk);
                            var max_cputime = data['max_cputime']['value'] / 3600;
                            var max_walltime = data['max_walltime']['value'] / 3600;
                            var efficiency = "----";
                            if (max_walltime > 0) {
                                efficiency = (max_cputime / max_walltime * 100).toFixed(1) + '%';
                            }
                            var request_time = data['request_walltime']['value'] / 3600;
                            var bg_time = background_style(max_walltime, request_time);
                            return '<tr>' + '<td rowspan="2"><a style="text-decoration:underline;" href="dashboard/db/job-cluster-summary?var-cluster=' + data['key'] + '&var-schedd=' + schedd + '">' + data['key'] + '@' + schedd + '</a></td>' + '<td rowspan="2">' + data['status']['buckets']['idle']['doc_count'] + '</td>' + '<td rowspan="2">' + data['status']['buckets']['running']['doc_count'] + '</td>' + '<td rowspan="2"' + bg_hold + '>' + data['status']['buckets']['held']['doc_count'] + '</td>' + '<td>' + data['submit_date']['value_as_string'] + '</td>' + '<td' + bg_mem + '>' + max_mem.toFixed(0) + ' / ' + request_mem.toFixed(0) + '</td>' + '<td' + bg_disk + '>' + max_disk.toFixed(0) + ' / ' + request_disk.toFixed(0) + '</td>' + '<td' + bg_time + '>' + max_walltime.toFixed(0) + ' / ' + request_time.toFixed(0) + '</td>' +
                            //'<td>'+ max_cputime.toFixed(2) +' hr</td>'+
                            '<td>' + efficiency + '</td>' + '<td>' + data['max_restarts'].value + '&nbsp;&nbsp;&nbsp;&nbsp;</td>' + '</tr><tr><td colspan="6" class="job-command">' + cmd + '</td>' + '</tr>';
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
                        var q = this.panel.query;
                        if (this.panel.userQuery !== '') {
                            q += ' AND ' + this.panel.userQuery;
                        }

                        var from = this.dashboard.time.from;
                        var to = this.dashboard.time.to;
                        if (this.panel.mode === 'Active') {
                            from = 'now-10m';
                            to = 'now';
                        }

                        var data = {
                            "size": 0,
                            "query": {
                                "filtered": {
                                    "query": {
                                        "query_string": { "query": q }
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
                                        "order": { "submit_date": "asc" }
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
                                            "max": {
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
                                                    "idle": { "term": { "status": 1 } },
                                                    "running": { "term": { "status": 2 } },
                                                    "cancelled": { "term": { "status": 3 } },
                                                    "complete": { "term": { "status": 4 } },
                                                    "held": { "term": { "status": 5 } }
                                                }
                                            }
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
