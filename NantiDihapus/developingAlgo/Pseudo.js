// LogicalToDDL
Input:  logicalModel logicalModel
Output: DDL string[]

stringQuery <- []
FOREACH cf IN logicalModel.columnFamiles:
  parentKeys <- []
  cfKeys <- []
  stringQuery.add('DROP TABLE IF EXISTS' + cf.label)
  stringQuery.add('CREATE TABLE' + cf.label + '(')
  IF (cf.parentColumnFam):
    parentAttributes <- cf.parentColumnFam.attributes
    FOREACH attr IN parentAttributes:
      IF (attr.type == 'Key' | 'Auxiliary'):
        stringQuery.add(attr.label)
        parentKeys.add(attr.label)
      ENDIF
    ENDFOR
  ENDIF
  IF (cf.attributes):
    parentAttributes <- cf.parentColumnFam.attributes
    FOREACH attr IN parentAttributes:
      stringQuery.add(attr.label)
      IF (attr.type == 'Key' | 'Auxiliary'):
        cfKeys.add(attr.label)
      ENDIF
    ENDFOR
  ENDIF
  createPrimaryKey(parentKeys, cfKeys, stringQuery)
  stringQuery.push(')')
ENDFOR

// createPrimaryKey
Input:  parentKeys string[],
        cfKeys string[],
        stringQuery string[]

primaryKey <- ''
IF (parentKeys.length > 0):
  primaryKey <- `(` + parentKeys.toString() + `)`
ENDIF
IF (cfKeys.length > 0):
  primaryKey <- primaryKey + cfKeys.toString()
ENDIF

stringQuery.add(`PRIMARY KEY (` + primaryKey + `)`)

// =================================================================================

// Convert ER to logicalSchema (revisi)
Input:  ERModel ERModel
Output: logicalShcmea LogicalShema

logicalSchema <- []
entities <- ERModel.entities
FOREACH entity IN entities:
  IF entity.type == ('Entity' | 'WeakEntity'):
     columnFamilySet <- createFamily(entityRelation, logicalSchema)
     logicalSchema <- merge(columnFamilySet, logicalSchema)
  ENDIF
ENDFOR
RETURN logicalSchema


// createFamily (revisi)
Input:  entityRelation EntityRelation,
        logicalSchema LogicalSchema,
Output: columnFamilySet LogicalSchema,

columnFamilySet <- logicalSchema
columnFamily <- {}
columnFamily <- logicalSchema.find(entityRelation.id)

IF (!isVisited(entityRelation.id)):
  visited.add(entityRelation.id)

  IF (entityRelation.type == ('Entity' | 'AssociativeEntity' | 'WeakEntity')):
    parentArray <- findParentArray(entityRelation)
    FOREACH entity in parentArray:
      newColumnFamily <- createFamily(entity, logicalSchema)
      columnFamilySet <- merge(newColumnFamily, columnFamilySet)
    ENDFOR
  ENDIF

  columnFamily.id <- entityRelation.id
  columnFamily.label <- entityRelation.label
  columnFamily.attributes <- defineKey(entityRelation, columnFamilySet, columnFamily)

  IF (isHasParent):
    columnFamily.parentID <- getParentID(parentID, columnFamilySet)
    parent <- columnFamilySet.find(parentID)
    columnFamily.attributes <- mergeArray(columnFamily.attributes, parent.Attributes)
    isHasParent <- false
  ENDIF

  FOREACH attribute IN entityRelation.attribues:
    convertedAttributes <- convertAttribute(columnFamily, attribute)
    columnFamilySet <- merge(columnFamilySet, convertedAttributes)
  ENDFOR

  IF (entityRelation.type == ('Relationship' | 'ReflexiveRelationship')):
    columnFamily.isFromRelationship <- true
  ENDIF

  columnFamilySet.add(columnFamily)

  IF (entityRelation.type == ('Entity' | 'AssociativeEntity' | 'WeakEntity')):
    relationArray <- findRealtionArray(entityRelation)
    FOREACH relation in relationArray:
      convertedRelation <- convertRelationship(entity, logicalSchema)
      columnFamilySet <- merge(convertedRelation, columnFamilySet)
    ENDFOR
  ENDIF
ENDIF
RETURN columnFamilySet


// convertAttribute 
Input : CF ColumnFamily, 
        attribute Attribute,
Output: additionalCF ColumnFamily[],

additionalCF <- [],
IF (attribute.type == 'Composite'):
  newCF <- {}
  newCF.label <- CF.label + attribute.label
  newCF.parentID <- CF.prentID | CF.id
  newCF.attribues = CF.attributes.keys
  IF (attribute.children):
    FOREACH child IN children:
     additionalCF <- merge(additionalCF,
                      convertAttribute(newCF, child))
    additionalCF.add(newCF)
  ENDIF
ELSE:
  newColumn <- {}
  newColumn.label <- attribute.label
  CF.attributes = merge(newColumn, CF.attributes)
ENDIF
RETURN additionalCF

// defineKey
Input : entityRelation EntityRelation,
        logicalSchema LogicalSchema,
Output: key Attribute[],

key <- getArrayKey(EntityRelation.attributes)
IF (entityRelation.type == ('Entity' | 'AssociativeEntity' | 'WeakEntity')):
  key = key.concat(findParentKey(entityRelation, logicalSchema))
ELSE
  key = key.concat(findRelationship(entityRelation, logicalSchema))
ENDIF
IF (key.length < 1 & NOT(isHasParent)):
  key.add(entityRelationLabel + '_id')
ENDIF
RETURN arrayKeysToAttribute(key)


// convertRelationship
Input : cf ColumnFamily,
        logicalSchema LogicalSchema,
        relationDetail {type: string, relation: EntityRelation, entityAcrossId: number}
Output: newLogicalSchema LogicalSchema,

newLogicalSchema <- []
IF (relationDetail.type == 'BinaryRelationship'):
  cfFromRelation = createFamily(relationDetail.relation, logicalSchema)
  IF (NOT(isSameKey(cf, cfFromRelation)) | relationDetail.relation.type == 'Reflexive'):
    newLogicalSchema = merge(newLogicalSchema, 
                      createArtificialRelation(cfFromRelation, cf, relationDetail, 
                      logicalSchema))
  ENDIF
ELSE IF (relationDetail.type == 'AssociativeEntity'): 
  newLogicalSchema = createFamily(relationDetail.relation, logicalSchema

  temporaryRelationDetail = {
    type: 'BinaryRelationship',
    relation: {
      id: relationDetail.relation.id,
      label: relationDetail.relation.label,
      type: 'Relationship',
      isTemporaryRelation: true,
    }
  }

  converted <- convertRelationship(temporaryRelationDetail, cf, newLogicalSchema)
  newLogicalSchema = merge(converted, newLogicalSchema)

ELSE IF (relationDetail.type == 'Specialization'):
  IF (NOT(relationDetail.relation.isTotal))
    parentColumnFamily <- logicalSchema.find(relationDetail.relation.parentID)
    newLogicalSchema = merge(newLogicalSchema, 
                    createArtificialRelation(cf, parentColumnFamily, relationDetail, 
                    logicalSchema))
  ENDIF
ENDIF

RETURN newLogicalSchema

// createArtificialRelation
Input : cf1 ColumnFamily,
        cf2 ColumnFamily,
        logicalSchema LogicalSchema
        relationDetail {type: string, relation: EntityRelation, entityAcrossId: number}
Output: newLogicalSchema LogicalSchema,

newLogicalSchema <- []
newColumnfamily <- []

IF (cf1.isFromRelationship) THEN
  newColumnfamily <- cf1
ELSE
  preexistCF = logicalSchema.find(cf1.id)
  IF (preexistCF) THEN
    newColumnFamily <- preexistCF
  ENDIF
ENDIF

IF (NOT(newColumnFamily)) THEN
  temporarEntity <- {
    label: cf1.label + cf2.label
    type: 'Entity'
    isTemporaryEntity: true,
    parentID: cf1.id
  }
  newColumnFamily <- createFamily(temporaryColumnFamily, logicalSchema)
ENDIF

auxColumn <- {}
auxColumn.label <- cf2.label
auxColumn.isKey <- true
auxColumn.artificialID = artificialID
newColumnFamily.attributes.add(auxColumn)

IF (relationDetial.type != 'BinaryManyToMany') THEN
  interColumn = {}
  interColumn.label = cf1.label
  interColumn.isIntermediary = true
  interColumn.artificialID = artificialID
  cf2.attributes.add(artificialID)
ENDIF

newLogicalSchema <- merge(newLogicalSchema, newColumnFamily, cf2)

RETURN newLogicalSchema



==========================================LAMPIRAN=========================================
// getParentID
Input : id number, logicalSchema LogicalSchema,
Output: id number,

parent <- logicalSchema.find(id)
IF (prent.parentID):
  RETURN getParentID(parent.parentID, logicalSchema)
ELSE:
  RETURN id
ENDIF

// findParentArray
Input : entityRelation Shape,
Output: parentArray Shape[],

parentArray <- []
connecotrs <- entityRelation.connecotrs
FOREACH connectorFrom IN connectors:
  IF (connectorFrom.type == 'ChildrenSpecialization'):
    specializationShape <- ERModel.find(connector.from)
    parentEntity <- ERModel.find(specializationShape.parentID)
    parentArray.add(parentEntity)
  ENDIF
  ELSE IF (connector.type == 'RelationConnector'):
    relation <- ERModel.find(connector.to)
    connectorTo <- relation.connector //different from connectorFrom
    IF (relation.type == 'Relationship'):
      IF ((connectorFrom.cardinality == 'Many' & 
          connectorTo.cardinality == 'One') ||
          (connectorFrom.cardinality == 'One' &
          connectorFrom.participation == 'Partial' &
          connectorTo.cardinality == 'One' &
          connectorTo.participation == 'Total' )):
        parentArray.add(ERModel.find(connectorTo.to))
      ENDIF
    ENDIF
  ENDIF
ENDFOR

interface RelationDetail {
  type: 'BinaryOneToOne' | 'BinaryOneToMany' | 'BinaryManyToMany',
  relations: Shape
  entityAcrossId?: number
}

// findRelationArray
Input : entityRelation Shape,
Output: relationDArray RelationDetail[],

relationDArray <- []
connecotrs <- entityRelation.connecotrs
FOREACH connectorFrom IN connectors:
  IF (connectorFrom.type == 'ChildrenSpecialization'):
    specializationShape <- ERModel.find(connector.from)
    relationArray.add({
      type: 'Specialization',
      relation: specializationShape,
      entityAcrossId: specializationShape.parentID
    })
  ENDIF
  ELSE IF (connector.type == 'RelationConnector'):
    relation <- ERModel.find(connector.to)
    connectorTo <- relation.connector //different from connectorFrom
    IF (relation.type == 'Relationship'):
      IF ((connectorFrom.cardinality == 'Many' & 
          connectorTo.cardinality == 'One') ||
          (connectorFrom.cardinality == 'Many' & 
          connectorTo.cardinality == 'Many') ||
          (connectorFrom.cardinality == 'One' &
          connectorTo.cardinality == 'One' &
          connectorTo.participation == 'Total' )):
        relationArray.add({
          type: 'Binary',
          relation: relation,
          entityAcrossId: connectorTo.to
        })
      ENDIF
    ELSE IF (relation.type == 'AssociavtiveEntity'):
      relationArray.add({
        type: 'AssociativeEntity',
        relation: relation,
        connector: connector
      })
    ENDIF
  ENDIF
ENDFOR

