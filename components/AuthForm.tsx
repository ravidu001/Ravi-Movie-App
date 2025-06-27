import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';

interface AuthFormProps<T extends { [key: string]: string }> {
  fields: { key: string; placeholder: string; secure?: boolean; autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters' }[];
  onSubmit: (values: T) => Promise<void>;
  submitButtonText: string;
  navigation: any;
  alternateAction?: { text: string; route: string };
}

const AuthForm = <T extends { [key: string]: string }>({ fields, onSubmit, submitButtonText, navigation, alternateAction }: AuthFormProps<T>) => {
  const [values, setValues] = useState<T>({} as T);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }) as T);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (fields.some((field) => !values[field.key])) {
      setError('All fields are required.');
      return;
    }

    try {
      await onSubmit(values);
      if (alternateAction) {
        Alert.alert('Success', `Successfully ${submitButtonText.toLowerCase().replace(' ', '')}! Please proceed.`);
        navigation.navigate(alternateAction.route);
      }
    } catch (err) {
      setError(`Failed to ${submitButtonText.toLowerCase().replace(' ', '')}. Please try again.`);
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{submitButtonText}</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {fields.map((field) => (
        <TextInput
          key={field.key}
          style={styles.input}
          placeholder={field.placeholder}
          value={values[field.key] || ''}
          onChangeText={(text) => handleChange(field.key, text)}
          secureTextEntry={field.secure}
          autoCapitalize={field.autoCapitalize}
          keyboardType={field.key === 'email' ? 'email-address' : 'default'}
        />
      ))}
      <Button title={submitButtonText} onPress={handleSubmit} />
      {alternateAction && (
        <Button
          title={alternateAction.text}
          onPress={() => navigation.navigate(alternateAction.route)}
          color="#666"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingHorizontal: 10 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

export default AuthForm;