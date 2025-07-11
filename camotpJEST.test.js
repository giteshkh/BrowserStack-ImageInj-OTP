const wdio = require('webdriverio');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
jest.setTimeout(480000); // 480 seconds

const BROWSERSTACK_USERNAME = "<BROWSERSTACK_USERNAME>"; // Replace with your BrowserStack username
const BROWSERSTACK_ACCESS_KEY = "<BROWSERSTACK_ACCESS_KEY>"; // Replace with your BrowserStack access key

const caps = {
  platformName: "android",
  "appium:platformVersion": "13.0",
  "appium:deviceName": "Samsung Galaxy S23 Ultra",
  "appium:app": "bs://ea9a809d738ea78e2c357d1c25af4ed4d70e9020",
  "appium:automationName": "UIAutomator2",
  "bstack:options": {
    enableSim: "true",
    simOptions: { region: "India" },
    userName: BROWSERSTACK_USERNAME,
    accessKey: BROWSERSTACK_ACCESS_KEY,
    appiumVersion: "2.0.1",
    projectName: "Demo OTP Sim",
    buildName: "BrowserStack Appium JEST",
    sessionName: "Camera Image Injection and OTP Retrieval",
    debug: true,
    networkLogs: true,
    appProfiling: true,
    enableCameraImageInjection: true,
  }
};

let driver;

async function uploadImage(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('mediaType', 'image');

  const response = await axios.post(
    'https://api-cloud.browserstack.com/app-automate/upload-media',
    form,
    {
      headers: form.getHeaders(),
      auth: {
        username: BROWSERSTACK_USERNAME,
        password: BROWSERSTACK_ACCESS_KEY,
      },
    }
  );
  return response.data.media_url;
}

beforeAll(async () => {
  driver = await wdio.remote({
    protocol: 'https',
    hostname: 'hub-cloud.browserstack.com',
    port: 443,
    path: '/wd/hub',
    capabilities: caps,
  });
});

afterAll(async () => {
  if (driver) await driver.deleteSession();
});

test('Camera image injection and capture', async () => {
  const mediaUrl = await uploadImage('./test-image.jpeg');

  await driver.execute(`browserstack_executor: {"action": "cameraImageInjection", "arguments": {"imageUrl": "${mediaUrl}"}}`);
  await driver.pause(3000);

  const clickIfVisible = async (selector, label) => {
    try {
      const el = await driver.$(selector);
      if (await el.isDisplayed()) {
        await el.click();
        await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "✅ Clicked ${label}", "level": "info"}}`);
        await driver.pause(1000);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "ℹ️ ${label} not shown", "level": "info"}}`);
    }
  };

  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("CAMERA1 API")', 'Camera 1 button');
  await driver.pause(3000);
  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("While using the app")', 'While using the app button');
  await driver.pause(3000);
  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("Allow")', 'Android permission Allow button');

  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("CAPTURE")', 'Capture button');
  await driver.pause(5000);

  try {
    const imageView = await driver.$('android=new UiSelector().className("android.widget.ImageView")');
    const isVisible = await imageView.isDisplayed();
    await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "${isVisible ? '✅' : 'ℹ️'} ImageView ${isVisible ? 'is displayed' : 'exists but not displayed'}", "level": "info"}}`);
  } catch (_) {
    await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "❌ ImageView not found", "level": "warn"}}`);
  }
  await driver.pause(5000);

  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("CAMERA1 API")', 'Camera 1 button');
  await driver.pause(3000);
  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("While using the app")', 'While using the app button');
  await driver.pause(3000);
  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("Allow")', 'Android permission Allow button');

  await clickIfVisible('android=new UiSelector().className("android.widget.Button").text("CAPTURE")', 'Capture button');
  await driver.pause(5000);

  try {
    const imageView = await driver.$('android=new UiSelector().className("android.widget.ImageView")');
    const isVisible = await imageView.isDisplayed();
    await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "${isVisible ? '✅' : 'ℹ️'} ImageView ${isVisible ? 'is displayed' : 'exists but not displayed'}", "level": "info"}}`);
  } catch (_) {
    await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "❌ ImageView not found", "level": "warn"}}`);
  }
});

test('OTP from notifications', async () => {
  try {
    const simInfo = await driver.execute('browserstack_executor: {"action": "deviceInfo", "arguments": {"deviceProperties": ["simOptions"]}}');
    const phoneNumber = simInfo?.["Phone Number"]?.replace(/^[^\d]*(\d+)/, '$1');
    if (phoneNumber) {
      await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "📞 Phone Number: ${phoneNumber}", "level": "info"}}`);
    }

    await driver.pressKeyCode(3);
    await driver.pause(1000);
    try {
      await driver.openNotifications();
      await driver.pause(2000);
      const clearBtn = await driver.$('android=new UiSelector().textContains("Clear")');
      await clearBtn.click();
    } catch (_) {}

    await driver.pause(60000);
    let otp = null;
    const contexts = await driver.getContexts();
    const nativeContext = contexts.find(ctx => ctx.toLowerCase().includes('native'));
    if (nativeContext) {
      await driver.switchContext(nativeContext);
      await driver.openNotifications();
      await driver.pause(2000);

      const start = Date.now();
      while (!otp && Date.now() - start < 30000) {
        const messages = await driver.$$('android.widget.TextView');
        for (const msg of messages) {
          const text = await msg.getText();
          if (text.toUpperCase().includes('OTP')) {
            const match = text.match(/\b\d{6}\b/);
            if (match) {
              otp = match[0];
              break;
            }
          }
        }
        if (!otp) await driver.pause(2000);
      }
      await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "${otp ? '✅ OTP Retrieved: ' + otp : '❌ OTP not found'}", "level": "${otp ? 'info' : 'warn'}"}}`);
    }
  } catch (e) {
    await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "❌ OTP test failed: ${e.message}", "level": "error"}}`);
  }
});
