import { writable } from 'svelte/store'

const browser = typeof window !== 'undefined'

type TSSContext = {
  settings: {
    bearerAuth: string
  }
}

const SSContextKey = 'SSRemultAdmin_2024_08_23'

const SSContextDefaults: TSSContext = {
  settings: {
    bearerAuth: '',
  },
}

const SSCurrentContext = browser
  ? JSON.parse(sessionStorage.getItem(SSContextKey)!) || SSContextDefaults
  : SSContextDefaults

/**
 * Local storage context store
 */
const store = () => {
  const { set, subscribe, update } = writable<TSSContext>(SSCurrentContext)

  return {
    set,
    subscribe,
    update,
    reset: () => {
      set(SSContextDefaults)
      window.location.reload()
    },
  }
}

export const SSContext = store()

SSContext.subscribe((value) => {
  if (browser) {
    if (!value) {
      localStorage.setItem(SSContextKey, JSON.stringify(SSContextDefaults))
    } else {
      localStorage.setItem(SSContextKey, JSON.stringify(value))
    }
  }
})
