const wdio = require('webdriverio');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
jest.setTimeout(480000); // 480 seconds

const BROWSERSTACK_USERNAME = "<BROWSERSTACK_USERNAME>"; // Replace with your BrowserStack username
const BROWSERSTACK_ACCESS_KEY = "<BROWSERSTACK_ACCESS_KEY>"; // Replace with your BrowserStack access key


const caps = {
  platformName: "ios",
  "appium:platformVersion": "15",
  "appium:deviceName": "iPhone 13",
  "appium:automationName": "XCUITest",
  "appium:app": "bs://44e759ee294720065220eb73528d56248e588fc3", // Replace with your iOS app ID
  "bstack:options": {
    enableSim: "true",
    simOptions: { region: "India" },
    userName: BROWSERSTACK_USERNAME,
    accessKey: BROWSERSTACK_ACCESS_KEY,
    appiumVersion: "2.0.1",
    projectName: "iOS Camera & OTP",
    buildName: "iOS Build - Appium JEST",
    sessionName: "iOS Camera Injection Test",
    debug: true,
    networkLogs: true,
    appProfiling: true,
    enableCameraImageInjection: true
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

test('iOS - Camera image injection and capture', async () => {
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

  // Example buttons in your iOS app - replace with actual accessibility ids or text
  await clickIfVisible('-ios predicate string:type == "XCUIElementTypeStaticText" AND name == "Camera"', 'Camera');
  await driver.pause(2000);
  await clickIfVisible('-ios predicate string:type == "XCUIElementTypeStaticText" AND name == "Image Injection"', 'Image Injection');
  await driver.pause(2000);
  await clickIfVisible('-ios predicate string:type == "XCUIElementTypeButton" AND name == "Camera Button 1"', 'camera');
  await driver.pause(2000);
    await clickIfVisible('-ios predicate string:type == "XCUIElementTypeButton" AND (name == "OK" OR name == "Allow")', 'Camera Permission');
    await driver.pause(2000);
  await clickIfVisible('-ios predicate string:type == "XCUIElementTypeButton" AND name == "PhotoCapture"', 'Take Picture');
  await driver.pause(5000);

  try {
    const imageView = await driver.$('//XCUIElementTypeOther');
    const isVisible = await imageView.isDisplayed();
    await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "${isVisible ? '✅' : 'ℹ️'} ImageView ${isVisible ? 'is displayed' : 'exists but not displayed'}", "level": "info"}}`);
  } catch (_) {
    await driver.execute(`browserstack_executor: {"action": "annotate", "arguments": {"data": "❌ ImageView not found", "level": "warn"}}`);
  }
});

