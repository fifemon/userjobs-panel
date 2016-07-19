![Fifemon User Jobs Table](src/img/jobs_table_icon_large.png)

# userjobs

Display aggregate summaries of documents from an Elasticsearch table. 
Columns and aggregations are currently hardcoded and specific for Fifemon.

# screenshots

![Active Jobs](src/img/active_jobs.png)
![Completed Jobs](src/img/completed_jobs.png)
![Active Jobs with custom filter](src/img/active_jobs_filtered.png)
![Panel options](src/img/options.png)

# Changelog

## 0.2.0

* Set `lowercase_expanded_terms: false` in query since we are querying against `not_analyzed` fields.
* Fixed README and icons
* Add screenshots
