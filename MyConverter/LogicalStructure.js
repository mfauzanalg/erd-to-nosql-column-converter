const logicalStructure = [
  {
    name: String,
    attributes: [
      {
        name: String,
        additional: {
          isKey: Boolean,
        }
      }
    ]
  }
]

const attributes = [
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