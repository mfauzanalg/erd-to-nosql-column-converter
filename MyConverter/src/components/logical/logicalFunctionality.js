function loadLogical(logicalSchema) {
  myLogicalDiagram.model = go.Model.fromJson(JSON.stringify(logicalSchema));
}


const createTableInput = (cf) => {
  let dataTable = ''
  console.log(cf)

  dataTable += `
  <div class="table-input-container">
    <div class="table-title">${cf.label}</div>
  `
  
  cf.attributes?.forEach((attr) => {
    dataTable += `
    <div class="attribute-container">
      <div class="attribute-name">${attr.label}</div>
      <select class="attribute-input">
        <option value="ascii">ascii</option>
        <option value="bigint">bigint</option>
        <option value="blob">blob</option>
        <option value="boolean">boolean</option>
        <option value="date">date</option>
        <option value="decimal">decimal</option>
        <option value="double">double</option>
        <option value="int">int</option>
        <option value="float">float</option>
        <option value="timestamp">timestamp</option>
        <option value="varchar">varchar</option>
        <option value="uuid">uuid</option>
        <option value="text" selected>text</option>
        <option value="time">time</option>
      </select>
    </div>
    `
  })

  dataTable +=`
  </div>
  `

  return dataTable
}

const createTableInputAttribute = (columnFamilies) => {  
  let data = ''

  columnFamilies.forEach((cf) => {
    data += createTableInput(cf)
  })

  return data
}

const showDataTypeForm = () => {
  document.getElementById("convertDDL-btn").style.display = "none"
  document.getElementById("button-container-logical").style.display = "none"
  document.getElementById("data-type-input-container").style.display = "block"

  const dataTypeFormComponent = createTableInputAttribute(logicalModel.columnFamilies)
  document.getElementById('data-type-input').insertAdjacentHTML("afterbegin", dataTypeFormComponent);
}

const convertToDDL = () => {
  document.getElementById("ddl-section").style.display = "block"
}