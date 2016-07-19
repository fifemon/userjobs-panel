# userjobs

Display aggregate summaries of documents from an Elasticsearch table. 
Columns and aggregations are currently hardcoded and specific for Fifemon.

# Changelog

## 0.2.0

* Set `lowercase_expanded_terms: false` in query since we are querying against `not_analyzed` fields.
* Fixed README and icons
* Add screenshots
