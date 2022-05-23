import {
  QMainWindow,
  QWidget,
  QLabel,
  FlexLayout,
  QPixmap,
  QPushButton,
  QMessageBox,
  ButtonRole,
  QIcon,
  QSystemTrayIcon,
  QAction,
  QMenu,
  QApplication,
} from '@nodegui/nodegui'
import cpu from '../assets/CPU50.png'
import ram from '../assets/RAM50.png'
import hdd from '../assets/HDD50.png'
import iconImg from '../assets/monitor.png'

import { freemem } from 'os'

const win = new QMainWindow()
win.setWindowTitle('DMS System Monitor')
win.setWindowOpacity(0.9)

const os = require('os')
var disk = require('diskusage')
var path = os.platform() === 'win32' ? 'c:' : '/'

const centralWidget = new QWidget()
centralWidget.setObjectName('myroot')
const rootLayout = new FlexLayout()
centralWidget.setLayout(rootLayout)

const trayIcon = new QIcon(iconImg)
const tray = new QSystemTrayIcon()
tray.setIcon(trayIcon)
tray.setToolTip('DMS-System-Monitor')
win.setWindowIcon(trayIcon)
tray.show()

tray.addEventListener('activated', () => {
  if (win.isVisible()) {
    win.hide()
  } else {
    win.show()
  }
})

const trayMenu = new QMenu()
tray.setContextMenu(trayMenu)
const action = new QAction()
trayMenu.addAction(action)
action.setText('Quit')
action.addEventListener('triggered', () => {
  process.exit(1)
})
const qApp = QApplication.instance()
qApp.setQuitOnLastWindowClosed(false) // avoid closing the window on close button

global.tray = tray
global.trayMenu = trayMenu

const labelImage = new QLabel()
labelImage.setObjectName('imageLabel')
const image = new QPixmap()
image.load(cpu)
labelImage.setPixmap(image)

const ramImageLabel = new QLabel()
ramImageLabel.setObjectName('ramImage')
const imageR = new QPixmap()
imageR.load(ram)
ramImageLabel.setPixmap(imageR)

const hddImageLabel = new QLabel()
hddImageLabel.setObjectName('hddImage')
const imageH = new QPixmap()
imageH.load(hdd)
hddImageLabel.setPixmap(imageH)

// const label = new QLabel()
// label.setObjectName('mylabel')
// label.setText('DMS System Monitor')

const label3 = new QLabel()
label3.setInlineStyle('font-size:12; font-weight: bold; padding: 4; opacity:1')

const modelLabel = new QLabel()
const modelName = os.cpus().map((cpu) => cpu.model)
modelLabel.setText('Model: ' + modelName[0])
modelLabel.setInlineStyle('font-size:12; font-weight: bold; padding: 4;')

const coreSpeedLabel = new QLabel()
coreSpeedLabel.setInlineStyle('font-size:12; font-weight: bold; padding: 4;')

const coreTempLabel = new QLabel()
coreTempLabel.setInlineStyle('font-size:12; font-weight: bold; padding: 4;')

const freeRamLabel = new QLabel()
freeRamLabel.setInlineStyle('font-size:12; font-weight: bold; padding: 4;')

const totalRamLabel = new QLabel()
const totalRam = os.totalmem()

totalRamLabel.setInlineStyle('font-size:12; font-weight: bold; padding: 4;')
totalRamLabel.setText(
  'Total RAM: ' + Math.round(totalRam / (1024 * 1024 * 1024)) + ' Gb'
)

const percentageUsedLabel = new QLabel()
percentageUsedLabel.setInlineStyle(
  'font-size:12; font-weight: bold; padding: 4;'
)

const swapUsedLabel = new QLabel()
swapUsedLabel.setInlineStyle('font-size:12; font-weight: bold; padding: 4;')

const diskUsageLabel = new QLabel()
diskUsageLabel.setInlineStyle('font-size:12; font-weight: bold; padding: 4;')

const diskTotalLabel = new QLabel()
diskTotalLabel.setInlineStyle('font-size:12; font-weight: bold; padding:4;  ')
disk
  .check(path)
  .then((info) =>
    diskTotalLabel.setText(
      'Total disk space: ' +
        (info.total / (1024 * 1024 * 1024)).toFixed(2) +
        ' Gb'
    )
  )

const diskPercentageLabel = new QLabel()
diskPercentageLabel.setInlineStyle(
  'font-size:12; font-weight: bold; padding: 4;'
)

const button = new QPushButton()
button.setText('Clear RAM')
button.setInlineStyle('font-weight: bold;')
button.addEventListener('clicked', () => {
  var sudo = require('sudo-prompt')
  var options = {
    name: 'DMS System Monitor',
  }
  sudo.exec(
    'sync; sysctl -w vm.drop_caches=3; sync',
    options,
    function (error, stdout, stderr) {
      if (error) button.setText('Error ❌')
      console.log('stdout: ' + stdout)
      setTimeout(ResetButton, 4000)

      if (stderr) {
        button.setText('Error ❌')
        setTimeout(ResetButton, 4000)
      }

      if (stdout) {
        button.setText('Done ✔️')
        button.setInlineStyle('color:green')
        setTimeout(ResetButton, 4000)
      }
    }
  )
})

const messageBox = new QMessageBox()
messageBox.setText(
  'This action will clear the apt cache and unused kernel modules, perform it if you are sure that you do not need any older kernel modules anymore.'
)
const ok = new QPushButton()
ok.setText('Ok')
ok.addEventListener('clicked', () => {
  CleanAll()
  freeSpace.setText('Clean Up 🕒')
})
const cancel = new QPushButton()
cancel.setText('Cancel')
messageBox.addButton(ok, ButtonRole.ApplyRole)
messageBox.addButton(cancel, ButtonRole.DestructiveRole)

const freeSpace = new QPushButton()
freeSpace.setText('Clean Up')
freeSpace.setInlineStyle('font-weight: bold;')

freeSpace.addEventListener('clicked', () => {
  messageBox.exec()
})

function ResetButton() {
  freeSpace.setText('Clean Up')
  freeSpace.setInlineStyle('font-size:12; font-weight: bold; color: black;')
  button.setText('Clear RAM')
  button.setInlineStyle('font-size:12; font-weight: bold; color: black;')
}

function CleanAll() {
  var sudo = require('sudo-prompt')
  var options = {
    name: 'DMS System Monitor',
  }
  sudo.exec(
    'apt clean && apt autoremove -y',
    options,
    function (error, stdout, stderr) {
      if (error) {
        freeSpace.setText('Error ❌')
        setTimeout(ResetButton, 4000)
        return
      }
      if (stderr) {
        freeSpace.setText('Error ❌')
        setTimeout(ResetButton, 4000)
      }
      if (stdout) {
        freeSpace.setText('Done ✔️')
        freeSpace.setInlineStyle('color:green')
        setTimeout(ResetButton, 4000)
      }
    }
  )
}

const versionLabel = new QLabel()
versionLabel.setInlineStyle(
  "font-size:12; font-weight: bold; padding: 4; align-self:'center'"
)
versionLabel.setText('Version: 1.1.0')

var intervalID = setInterval(myCallback, 1500)

function coreTemperature() {
  var spawn = require('child_process').spawn

  var temp = spawn('cat', ['/sys/class/thermal/thermal_zone0/temp'])

  temp.stdout.on('data', function (data) {
    coreTempLabel.setText('Core Temp: ' + data / 1000 + ' C')
  })
}

function myCallback() {
  var cpus = os.cpus()
  var cspeed = os.cpus().map((cpu) => cpu.speed)
  var freeRam = freemem()

  disk
    .check(path)
    .then((info) =>
      diskUsageLabel.setText(
        'Available disk space: ' +
          (info.available / (1024 * 1024 * 1024)).toFixed(2) +
          ' Gb'
      )
    )

  disk
    .check(path)
    .then((info) =>
      diskPercentageLabel.setText(
        'Used disk space: ' +
          (((info.total - info.available) / info.total) * 100).toFixed(2) +
          ' %'
      )
    )

  for (var i = 0, sum = 0; i < cpus.length; sum += cspeed[i++]);
  coreSpeedLabel.setText('Core frequency: ' + cspeed + ' MHz')
  label3.setText(
    'Total frequency: ' + (sum / cpus.length / 1000).toFixed(2) + ' GHz'
  )

  coreTemperature()
  freeRamLabel.setText(
    'Free RAM: ' + (freeRam / (1024 * 1024 * 1024)).toFixed(2) + ' Gb'
  )

  percentageUsedLabel.setText(
    'Used RAM: ' + (((totalRam - freeRam) / totalRam) * 100).toFixed(2) + ' %'
  )
}

rootLayout.addWidget(labelImage)
rootLayout.addWidget(modelLabel)
rootLayout.addWidget(coreSpeedLabel)
rootLayout.addWidget(label3)
rootLayout.addWidget(coreTempLabel)
rootLayout.addWidget(ramImageLabel)
rootLayout.addWidget(totalRamLabel)
rootLayout.addWidget(freeRamLabel)
rootLayout.addWidget(percentageUsedLabel)
rootLayout.addWidget(hddImageLabel)
rootLayout.addWidget(diskTotalLabel)
rootLayout.addWidget(diskUsageLabel)
rootLayout.addWidget(diskPercentageLabel)
rootLayout.addWidget(button)
rootLayout.addWidget(freeSpace)
rootLayout.addWidget(versionLabel)

win.setCentralWidget(centralWidget)
win.setStyleSheet(
  `
    #myroot {
      background-color: #F6F5F2;
      height: '100%';
      
    }
    #mylabel {
      font-size: 16px;
      font-weight: bold;
      padding: 1;
      flex:1;
      align-self:'center'
    }
    #imageLabel{
    padding:4;
    align-self:'center'
    }
    #ramImage{
      padding:4;
      align-self: 'center'
    }
    #hddImage{
      padding:4;
      align-self: 'center'
    }
  `
)
win.show()
