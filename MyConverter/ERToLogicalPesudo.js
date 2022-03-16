const {Shape} = require('gojs');

// Convert ER to logicalSchema
Input:  ERSchema ERSchema
Output: logicalShcmea LogicalShema

logicalSchema <- []
shapes <- ERSchema.shapes
FOREACH shape IN shapes:
  IF shape.type == ('Entity' | 'WeakEntity'):
    columnFamilySet <- createFamily(shape, logicalSchema)
    logicalSchema <- mergeLogicalSchema(columnFamilySet, logicalSchema)
  ENDIF
ENDFOR


// mergeLogicalSchema
Input:  l1 LogicalShema, l2 LogicalSchema
Output: newLogical logicalSchema

newLogical <- l1 + l2
newLogical <- removeDuplicate(newLogical)
RETURN newLogical


// CreateFamily
Input:  entityRelation Shape,
        logicalSchema LogicalSchema,
Output: columnFamilySet LogicalSchema,

columnFamilySet <- logicalSchema
columnFamily <- {}
columnFamily <- logicalSchema.find(entityRelation.id)

IF (!isVisited(entityRelation.id)):
  visited.push(entityRelation.id)

  IF (entityRelation.type == ('Entity' | 'AssociativeEntity' | 'WeakEntity')):
    parentArray <- findParentArray(entityRelation)
    FOREACH entity in parentArray:
      newColumnFamily <- createFamily(entity, logicalSchema)
      columnFamilySet <- mergeLogicalSchema(newColumnFamily, columnFamilySet)
    ENDFOR
  ENDIF

  columnFamily.id <- entityRelation.id
  columnFamily.label <- entityRelation.label

  IF (isHasParent):
    columnFamily.parentID <- getParentID(parentID, columnFamilySet)
    isHasParent <- false
  ENDIF

  FOREACH attribute IN entityRelation.attribues:
    convertedAttributes <- convertAttribute(columnFamily, attribute)
    columnFamilySet <- mergeLogicalSchema(columnFamilySet, convertedAttributes)
  ENDFOR

  IF (entityRelation.type == ('Relationship' | 'ReflexiveRelationship')):
    columnFamily.isFromRelationship <- true
  ENDIF

  columnFamilySet.push(columnFamily)

  IF (entityRelation.type == ('Entity' | 'AssociativeEntity' | 'WeakEntity')):
    relationArray <- findRealtionArray(entityRelation)
    FOREACH relation in relationArray:
      convertedRelation <- convertRelationship(entity, logicalSchema)
      columnFamilySet <- mergeLogicalSchema(convertedRelation, columnFamilySet)
    ENDFOR
  ENDIF
ENDIF
RETURN columnFamilySet

// findParentArray
Input : entityRelation Shape,
Output: parentArray Shape[],

parentArray <- []
connecotrs <- entityRelation.connecotrs
FOREACH connectorFrom IN connectors:
  IF (connectorFrom.type == 'ChildrenSpecialization'):
    specializationShape <- ERSchema.find(connector.from)
    parentEntity <- ERSchema.find(specializationShape.parentID)
    parentArray.push(parentEntity)
  ENDIF
  ELSE IF (connector.type == 'RelationConnector'):
    relation <- ERSchema.find(connector.to)
    connectorTo <- relation.connector //different from connectorFrom
    IF (relation.type == 'Relationship'):
      IF ((connectorFrom.cardinality == 'Many' & 
          connectorTo.cardinality == 'One') ||
          (connectorFrom.cardinality == 'One' &
          connectorFrom.participation == 'Partial' &
          connectorTo.cardinality == 'One' &
          connectorTo.participation == 'Total' )):
        parentArray.push(ERSchema.find(connectorTo.to))
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
    specializationShape <- ERSchema.find(connector.from)
    relationArray.push({
      type: 'Specialization',
      relation: specializationShape,
      entityAcrossId: specializationShape.parentID
    })
  ENDIF
  ELSE IF (connector.type == 'RelationConnector'):
    relation <- ERSchema.find(connector.to)
    connectorTo <- relation.connector //different from connectorFrom
    IF (relation.type == 'Relationship'):
      IF ((connectorFrom.cardinality == 'Many' & 
          connectorTo.cardinality == 'One') ||
          (connectorFrom.cardinality == 'Many' & 
          connectorTo.cardinality == 'Many') ||
          (connectorFrom.cardinality == 'One' &
          connectorTo.cardinality == 'One' &
          connectorTo.participation == 'Total' )):
        relationArray.push({
          type: 'Binary',
          relation: relation,
          entityAcrossId: connectorTo.to
        })
      ENDIF
    ELSE IF (relation.type == 'AssociavtiveEntity'):
      relationArray.push({
        type: 'AssociativeEntity',
        relation: relation,
        connector: connector
      })
    ENDIF
  ENDIF
ENDFOR


// getParentID
Input : id number, logicalSchema LogicalSchema,
Output: id number,

parent <- logicalSchema.find(id)
IF (prent.parentID):
  RETURN getParentID(parent.parentID, logicalSchema)
ELSE:
  RETURN id
ENDIF

// convertAttribute
Input : CF ColumnFamily, 
        attribute Attribute,
Output: additionalCF ColumnFamily[],

additionalCF <- [],
IF (attribute.type == 'Composite'):
  newCF <- {}
  newCF.label <- CF.label + attribute.label
  newCF.parentID <- CF.prentID | CF.id
  IF (attribute.children):
    FOREACH child IN children:
     additionalCF <- mergeLogicalSchema(additionalCF,
                      convertAttribute(newCF, child))
    additionalCF.push(newCF)
  ENDIF
ELSE:
  newColumn <- {}
  newColumn.label <- attribute.label
  CF.attributes.push(newColumn)
ENDIF
RETURN additionalCF <- []

// defineKey
Input : entityRelation Shape,
        logicalSchema LogicalSchema,
Output: key string[],

key <- []
IF (entityRelation.key):
  key = entityRelation.key
ENDIF
IF (entityRelation.type == ('Entity' | 'AssociativeEntity' | 'WeakEntity')):
  key = key.concat(findParentKey(entityRelation, logicalSchema))
ELSE
  key = key.concat(findRelationship(entityRelation, logicalSchema))
ENDIF
IF (key.length < 1 & NOT(isHasParent)):
  key.push(entityRelationLabel + '_id')
ENDIF
RETURN key









