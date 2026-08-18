import { View } from 'react-native'
import React from 'react'
import SearchInput from '../../../../components/ui/SearchInput'
import RoundButton from '../../../../components/ui/RoundButton'
import { SlidersHorizontal } from 'lucide-react-native'
import { Colors } from '../../../../constant/colors'
import { useNavigation } from '@react-navigation/native'

type Props = {
  openFilterPanel: () => void;
}

const SearchContainer = ({ openFilterPanel }: Props) => {
  const nav: any = useNavigation();

  return (
    <View style={
      {
        flexDirection: 'row',
        gap: 12
      }
    }>
      <View style={{ flex: 1 }}>
        <SearchInput onPress={() => nav.navigate('Search')} />
      </View>
      <RoundButton
        onPress={openFilterPanel}
        Icon={<SlidersHorizontal color={Colors.SECONDARY_COLOR} size={20} />}
      />
    </View>
  )
}

export default SearchContainer
