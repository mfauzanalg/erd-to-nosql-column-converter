function loadLogical(logicalSchema) {
  myLogicalDiagram.model = go.Model.fromJson(JSON.stringify(logicalSchema));
}


const createTableInput = (cf) => {
  let dataTable = ''

  dataTable += `
  <div class="table-input-container">
    <div class="table-title">${cf.label}</div>
  `
  
  cf.attributes?.forEach((attr) => {
    dataTable += `
    <div class="attribute-container">
      <div class="attribute-name">${attr.label}</div>
      <select class="attribute-input" id="${cf.label}-${attr.label}">
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

const createKeyspace = (name) => {
  const newName = name.replace(/ /g, "_");

  return `CREATE KEYSPACE ${newName}
WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 1};

USE ${newName};

`
  
}

const convertToDDL = () => {
  document.getElementById("ddl-section").style.display = "block"
  const stringQuery = logicalToDDL(logicalModel)
  const joinedQuery = createKeyspace(ername.value) +  stringQuery.join('\n')

  const textareaDDL = document.getElementById("ddl-content")
  textareaDDL.value = joinedQuery
  textAreaAdjust(textareaDDL)
}

const copyDDL = () => {
  const textareaDDL = document.getElementById("ddl-content")
  copyToClipboard(textareaDDL.value)
  alert('Successfully Copy DDL to Clipboard')
}

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = (25+element.scrollHeight)+"px";
}

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

const scrollToTop = () => {
  document.getElementById("er-section").scrollIntoView()
  // window.scrollTo(0, 0);
}