export default async () => {
   const content = {
      "compilerOptions": {
         "target": "es5",
         "lib": [
            "dom",
            "dom.iterable",
            "esnext"
         ],
         "allowJs": true,
         "skipLibCheck": true,
         "esModuleInterop": true,
         "allowSyntheticDefaultImports": true,
         "strict": true,
         "forceConsistentCasingInFileNames": true,
         "module": "esnext",
         "moduleResolution": "node",
         "resolveJsonModule": true,
         "isolatedModules": true,
         "noEmit": true,
         "jsx": "react"
      },
      "include": ["src"],
      "exclude": [
         "node_modules",
         "build"
      ]
   }

   return {
      content: JSON.stringify(content, null, 2),
      filename: "tsconfig.json"
   }
}