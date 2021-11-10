import {
  QMainWindow,
  QWidget,
  QLabel,
  FlexLayout,
  QPixmap,
  QPushButton,
} from "@nodegui/nodegui";
import cpu from "../assets/CPU50.png";
import ram from "../assets/RAM50.png";
import hdd from "../assets/HDD50.png";
import appIcon from "../assets/iconSysMon1.png";

import { freemem } from "os";

// QApplication::setWindowIcon();

const win = new QMainWindow();
win.setWindowTitle("DMS System Monitor");
win.setWindowOpacity(0.9);
// win.setWindowIcon(appIcon);

const os = require("os");
var disk = require("diskusage");
var path = os.platform() === "win32" ? "c:" : "/";

const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);

const labelImage = new QLabel();
labelImage.setObjectName("imageLabel");
const image = new QPixmap();
image.load(cpu);
labelImage.setPixmap(image);

const ramImageLabel = new QLabel();
ramImageLabel.setObjectName("ramImage");
const imageR = new QPixmap();
imageR.load(ram);
ramImageLabel.setPixmap(imageR);

const hddImageLabel = new QLabel();
hddImageLabel.setObjectName("hddImage");
const imageH = new QPixmap();
imageH.load(hdd);
hddImageLabel.setPixmap(imageH);

const label = new QLabel();
label.setObjectName("mylabel");
label.setText("DMS System Monitor");

const label3 = new QLabel();
label3.setInlineStyle("font-size:12; font-weight: bold; padding: 4; opacity:1");

const modelLabel = new QLabel();
const modelName = os.cpus().map((cpu) => cpu.model);
modelLabel.setText("Model: " + modelName[0]);
modelLabel.setInlineStyle("font-size:12; font-weight: bold; padding: 4;");

const coreSpeedLabel = new QLabel();
coreSpeedLabel.setInlineStyle("font-size:12; font-weight: bold; padding: 4;");

const freeRamLabel = new QLabel();
freeRamLabel.setInlineStyle("font-size:12; font-weight: bold; padding: 4;");

const totalRamLabel = new QLabel();
const totalRam = os.totalmem();
totalRamLabel.setInlineStyle("font-size:12; font-weight: bold; padding: 4;");
totalRamLabel.setText(
  "Total RAM: " + Math.round(totalRam / (1024 * 1024 * 1024)) + " Gb"
);

const percentageUsedLabel = new QLabel();
percentageUsedLabel.setInlineStyle(
  "font-size:12; font-weight: bold; padding: 4;"
);

const diskUsageLabel = new QLabel();
diskUsageLabel.setInlineStyle("font-size:12; font-weight: bold; padding: 4;");

const diskTotalLabel = new QLabel();
diskTotalLabel.setInlineStyle("font-size:12; font-weight: bold; padding:4;  ");
disk
  .check(path)
  .then((info) =>
    diskTotalLabel.setText(
      "Total disk space: " +
        (info.total / (1024 * 1024 * 1024)).toFixed(2) +
        " Gb"
    )
  );

const diskPercentageLabel = new QLabel();
diskPercentageLabel.setInlineStyle(
  "font-size:12; font-weight: bold; padding: 4;"
);

const button = new QPushButton();
button.setText("Clear RAM");
button.setInlineStyle("font-weight: bold");
button.addEventListener("clicked", () => {
  var sudo = require("sudo-prompt");
  var options = {
    name: "DMS System Monitor",
    icons: appIcon,
  };
  sudo.exec(
    "sync; sysctl -w vm.drop_caches=3; sync",
    options,
    function (error, stdout, stderr) {
      if (error) button.setText(error);
      console.log("stdout: " + stdout);
    }
  );
});

const versionLabel = new QLabel();
versionLabel.setInlineStyle(
  "font-size:12; font-weight: bold; padding: 4; align-self:'center'"
);
versionLabel.setText("Version: 1.0.1");

var intervalID = setInterval(myCallback, 1500);

function myCallback() {
  var cpus = os.cpus();
  var cspeed = os.cpus().map((cpu) => cpu.speed);
  var freeRam = freemem();
  disk
    .check(path)
    .then((info) =>
      diskUsageLabel.setText(
        "Available disk space: " +
          (info.available / (1024 * 1024 * 1024)).toFixed(2) +
          " Gb"
      )
    );

  disk
    .check(path)
    .then((info) =>
      diskPercentageLabel.setText(
        "Used disk space: " +
          (((info.total - info.available) / info.total) * 100).toFixed(2) +
          " %"
      )
    );

  for (var i = 0, sum = 0; i < cpus.length; sum += cspeed[i++]);
  coreSpeedLabel.setText("Core frequency: " + cspeed + " MHz");
  label3.setText(
    "Total frequency: " + (sum / cpus.length / 1000).toFixed(2) + " GHz"
  );
  freeRamLabel.setText(
    "Free RAM: " + (freeRam / (1024 * 1024 * 1024)).toFixed(2) + " Gb"
  );

  percentageUsedLabel.setText(
    "Used RAM: " + (((totalRam - freeRam) / totalRam) * 100).toFixed(2) + " %"
  );
}

rootLayout.addWidget(label);
rootLayout.addWidget(labelImage);
rootLayout.addWidget(modelLabel);
rootLayout.addWidget(coreSpeedLabel);
rootLayout.addWidget(label3);
rootLayout.addWidget(ramImageLabel);
rootLayout.addWidget(totalRamLabel);
rootLayout.addWidget(freeRamLabel);
rootLayout.addWidget(percentageUsedLabel);
rootLayout.addWidget(hddImageLabel);
rootLayout.addWidget(diskTotalLabel);
rootLayout.addWidget(diskUsageLabel);
rootLayout.addWidget(diskPercentageLabel);
rootLayout.addWidget(button);
rootLayout.addWidget(versionLabel);
win.setCentralWidget(centralWidget);
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
);
win.show();

(global as any).win = win;
