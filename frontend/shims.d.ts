declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'vue-prism-component' {
  import type { ComponentOptions } from 'vue'

  const component: ComponentOptions
  export default component
}
declare module 'vue-shepherd';
declare module '@videojs-player/vue';

// Image assets
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}

// Path alias image declarations
declare module '@images/*.png' {
  const src: string
  export default src
}

declare module '@images/*.jpg' {
  const src: string
  export default src
}

declare module '@images/*.jpeg' {
  const src: string
  export default src
}

declare module '@images/*.gif' {
  const src: string
  export default src
}

declare module '@images/*.svg' {
  const src: string
  export default src
}

declare module '@images/*.webp' {
  const src: string
  export default src
}

declare module '@images/*.ico' {
  const src: string
  export default src
}
