class PhysicalCassandra {
  constructor(label, tables) {
    this.label = label
    this.tables = tables || []
  }

  addTable(table) {
    this.tables.push(table)
  }

  setTables(tables) {
    this.tables = tables
  }
}

class Table {
  constructor(label, keys, columns) {
    this.label = label
    this.keys = keys
    this.columns = columns || []
  }

  setLabel(label) {
    this.label = label
  }

  setKeys(keys) {
    this.keys = keys
  }

  setColumns(columns) {
    this.columns = columns
  }

  addColumn(column) {
    this.columns.push(column)
  }
}

class Column {
  constructor(label, dataType) {
    this.label = label
    this.dataType = dataType
  }

  setLabel(label) {
    this.label = label
  }

  setDataType(dataType) {
    this.dataType = dataType
  }
}