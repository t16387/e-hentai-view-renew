import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  darken,
} from '@material-ui/core/styles'
import React, {
  createContext,
  useMemo,
  useReducer,
  Reducer,
  FC,
  useContext,
} from 'react'
import { pink, blue } from '@material-ui/core/colors'

export const DispatchContext = createContext<React.Dispatch<Action>>(() => {})

export type Action = { type: 'CHANGE'; payload: any }
export interface InitialThemeOptionsProps {
  paletteType: 'dark' | 'light'
}
const InitialThemeOptions: InitialThemeOptionsProps = {
  paletteType: 'dark',
}
const ThemeProvider: FC<{}> = ({ children }) => {
  const [themeOptions, dispatch] = useReducer<
    Reducer<InitialThemeOptionsProps, Action>
  >((state, action) => {
    switch (action.type) {
      case 'CHANGE':
        return {
          ...state,
          paletteType: action.payload.paletteType,
        }
      default:
        return state
    }
  }, InitialThemeOptions)

  const { paletteType } = themeOptions
  const theme = useMemo(() => {
    return createMuiTheme({
      palette: {
        type: paletteType,
        primary: {
          main: paletteType === 'light' ? blue[700] : blue[200],
        },
        secondary: {
          main: paletteType === 'light' ? darken(pink.A400, 0.1) : pink[200],
        },
        background: {
          default: paletteType === 'light' ? '#fff' : '#121212',
        },
      },
    })
  }, [paletteType])

  return (
    <MuiThemeProvider theme={theme}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </MuiThemeProvider>
  )
}

export default ThemeProvider

export function useThemeState() {
  const dispatch = useContext(DispatchContext)
  return dispatch
}