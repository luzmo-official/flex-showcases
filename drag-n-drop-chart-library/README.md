# Luzmo Flex showcase: Drag and Drop Chart Library

This project is intended to show the power of allowing users to create custom dashboards using a pre-configured chart library

## Installation & start

```bash
# install project depencies locally
npm install

# run application in dev mode
npm start
```

The application will be launched on `http://localhost:3000` 

## Known Issues
* RND move command takes precedence over brush filter completion, which locks user's mouse in moving charts but unable to finalize the brush filter.
* RND does not support collision detection / break points.
    * To Do: Migrate to a grid layout library like [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout/tree/master)
