const LogicalStructure = [
  {
    name: String,
    attributes: Attributes,
    children: [
      {
        name: String,
        attributes: Attributes
      }
    ]
  }
]

const Attributes = [
  {
    name: String,
    additional: {
      isKey: Boolean,
      isMultiple: Boolean,
      length: [Integer, Integer],
      isAuxiliary: Boolean,
      isIntermediary: Boolean,
      artificialId: Integer,
      isMandatory: Boolean,
    }
  }
]