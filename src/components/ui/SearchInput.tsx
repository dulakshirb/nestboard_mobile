import { View, TextInput, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { Search } from 'lucide-react-native'
import { Colors } from '../../constant/colors'

type Props = {
  editable?: boolean
  value?: string
  onChangeText?: (text: string) => void
  onSubmitEditing?: () => void
  onPress?: () => void
  placeholder?: string
  autoFocus?: boolean
}

const SearchInput = ({
  editable = false,
  value,
  onChangeText,
  onSubmitEditing,
  onPress,
  placeholder = 'Search your place',
  autoFocus = false,
}: Props) => {
  const content = (
    <View style={styles.container}>
      <Search color={Colors.ICON_GRAY} size={20} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.TEXT_GRAY}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
    </View>
  );

  if (onPress && !editable) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: '100%',
    borderRadius: 100,
    elevation: 2,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.TEXT_PRIMARY,
    padding: 0,
  },
});
