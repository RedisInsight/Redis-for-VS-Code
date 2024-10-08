import React from 'react'
import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeaderProps } from 'uiSrc/modules'
// import ModulesTypeDetails from '../modules-type-details/ModulesTypeDetails'
import { UnsupportedTypeDetails } from '../unsupported-type-details'
import { StringDetails } from '../string-details'
import { HashDetails } from '../hash-details'
import { ZSetDetails } from '../zset-details'
import { ListDetails } from '../list-details'
import { SetDetails } from '../set-details'
import { RejsonDetailsWrapper } from '../rejson-details'
// import { StreamDetails } from '../stream-details'

export interface Props extends KeyDetailsHeaderProps {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: (isCancelled: boolean) => void
}

const DynamicTypeDetails = (props: Props) => {
  const { keyType: selectedKeyType } = props

  const TypeDetails: any = {
    [KeyTypes.ZSet]: <ZSetDetails {...props} />,
    [KeyTypes.String]: <StringDetails {...props} />,
    [KeyTypes.Hash]: <HashDetails {...props} />,
    [KeyTypes.List]: <ListDetails {...props} />,
    [KeyTypes.Set]: <SetDetails {...props} />,
    [KeyTypes.ReJSON]: <RejsonDetailsWrapper {...props} />,
    [KeyTypes.Stream]: <UnsupportedTypeDetails />,
    // [KeyTypes.Stream]: <StreamDetails {...props} />,
  }

  // Supported key type
  if (selectedKeyType && selectedKeyType in TypeDetails) {
    return TypeDetails[selectedKeyType]
  }

  // // Unsupported redis modules key type
  // if (Object.values(ModulesKeyTypes).includes(selectedKeyType as ModulesKeyTypes)) {
  //   return <ModulesTypeDetails moduleName={MODULES_KEY_TYPES_NAMES[selectedKeyType]} />
  // }

  // Unsupported key type
  return <UnsupportedTypeDetails />
}

export { DynamicTypeDetails }
