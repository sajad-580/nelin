import { IConfig } from 'interfaces/config'
import { ThemeId } from 'interfaces/theme'
import pkj from 'package.json'

const config: IConfig = {
  title: 'Printer manager',
  version: pkj.version,
  themes: [],
  defaultTheme: ThemeId.chameleon,
}

export default config
