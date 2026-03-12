import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfigWithVueTs(
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  eslintConfigPrettier
)
