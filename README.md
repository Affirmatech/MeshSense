
# MeshSense

**MeshSense** is a simple, [open-source](https://github.com/Affirmatech/MeshSense) application that monitors, maps and graphically displays all the vital stats of your area's Meshtastic network including connected nodes, signal reports, trace routes and more!

![](https://affirmatech.com/meshsense.png)

MeshSense directly connects to your Meshtastic node via Bluetooth or WiFi and continuously provides all the information you need to assess the health of your network. For more detailed information, take a peek at our [Frequently Asked Questions](https://affirmatech.com/meshsense/faq) or [Bluetooth Tips](https://affirmatech.com/meshsense/bluetooth).

## Development Setup

To run MeshSense from the source code, first clone the MeshSense repo:
```sh
git clone https://github.com/Affirmatech/MeshSense.git
cd MeshSense
```

The `update.mjs` script will install the dependencies for the `ui`, `api`, and `electron` directories.
```sh
./update.mjs
```

During development, the electron portion is usually not needed.  First start the UI Vite service as follows:
```sh
cd ui
PORT=5921 npm run dev
```

Leave the UI running and then also start the API service.  The `DEV_UI_URL` will tell the API to forward any unhandled route requests to the UI service and should use the same port as above.
```sh
cd api
DEV_UI_URL=http://localhost:5921
PORT=5920 npm run dev
```

The `PORT` variables in the above are optional and will default to the values in the example, but ensure `DEV_UI_URL` is present with the correct port if changed.

The front-end should now be accessible by connecting to the **API** service in a browser.  Be careful not to connect to the UI service by accident.  http://localhost:5920/

Any API changes will automatically reload the service.  Any UI changes will be hot-reloaded by Vite.

**Please note:** currently certain event subscribers (particularly State variables) will duplicate their subscription when Vite hot-reloads resulting in duplicate events such as Log entries.  Until this is fixed, the easiest solution is to refresh the browser to reset the events.

To build the `ui`, `api`, and `electron` components, the `build.mjs` script will accomplish this.  The official electron builds are signed with an Affirmatech certificate on our build servers.  The deployables will be placed in `api/dist` and `electron/dist`.
