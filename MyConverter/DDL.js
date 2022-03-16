const DDL = {
  "keySpaceName": "Rental Mobil",
  "replication": {
    "class": "SimpleStrategy",
    "replicationFactor": 4,
    "dataCenters": [1,2,3],
  },
  "durableWrites":  true,
  "tables": [
    {
      "name": 'Car',
      "columns": [
        {
          "name": 'Plat_number',
          "dataType": "string",
          "columnDefenition": "string",
        }
      ],
      "key": [
        'Plat_number'
      ],
      "options": {
        "comment": "No comment"
      }
    }
  ],
}

export interface DDL {
  keySpaceName:  string;
  replication:   Replication;
  durableWrites: boolean;
  tables:        Table[];
}

export interface Replication {
  class:             string;
  replicationFactor: number;
  dataCenters:       number[];
}

export interface Table {
  name:    string;
  columns: Column[];
  key:     string[];
  options: Options;
}

export interface Column {
  name:             string;
  dataType:         string;
  columnDefenition: string;
}

export interface Options {
  comment: string;
}

enum DataType {
  ascii     = "ascii"
  bigint    = "bigint"
  blob      = "blob"
  boolean   = "boolean"
  date      = "date"
  decimal   = "decimal"
  double    = "double"
  float     = "float"
  int       = "int"
  map       = "map"
  set       = "set"
  tuple     = "tuple"
  timestamp = "timestamp"
  varchar   = "varchar"
  varint    = "varint"
  uuid      = "uuid"
  tinyint   = "tinyint"
  smallint  = "smallint"
  text      = "text"
  time      = "time"
}
