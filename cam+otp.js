const wdio = require('webdriverio');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const BROWSERSTACK_USERNAME = "<Your BrowserStack Username>";
const BROWSERSTACK_ACCESS_KEY = "<Your BrowserStack Access Key>";

const caps = {
  platformName: "android",
  "appium:platformVersion": "13.0",
  "appium:deviceName": "Samsung Galaxy S23 Ultra",
  "appium:app": "bs://ea9a809d738ea78e2c357d1c25af4ed4d70e9020", // camera+otp app
  "appium:automationName": "UIAutomator2",
  "bstack:options": {
    enableSim: "true",
    simOptions: { region: "India" },
    userName: BROWSERSTACK_USERNAME,
    accessKey: BROWSERSTACK_ACCESS_KEY,
    appiumVersion: "2.0.1",
    projectName: "Demo OTP Sim",
    debug: true,
    networkLogs: true,
    appProfiling: true,
    enableCameraImageInjection: true,
  }
};

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

async function main() {
  const driver = await wdio.remote({
    protocol: 'https',
    hostname: 'hub-cloud.browserstack.com',
    port: 443,
    path: '/wd/hub',
    capabilities: caps,
  });

  // ========== CAMERA IMAGE INJECTION ==========
  try {
    const imagePath = './test-image.jpeg';
    const mediaUrl = await uploadImage(imagePath);

    await driver.execute(
      `browserstack_executor: {
        "action": "cameraImageInjection",
        "arguments": {
          "imageUrl": "${mediaUrl}"
        }
      }`
    );
    await driver.pause(3000);
    try {
      const cam1btn = await driver.$('android=new UiSelector().className("android.widget.Button").text("CAMERA1 API")');
      if (await cam1btn.isDisplayed()) {
        await cam1btn.click();
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ Clicked Camera 1 button",
            "level": "info"
          }
        }`);
        await driver.pause(1000);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "ℹ️ No Camera 1 button found",
          "level": "info"
        }
      }`);
    }
    await driver.pause(3000);
    try {
      const cam1btn = await driver.$('android=new UiSelector().className("android.widget.Button").text("While using the app")');
      if (await cam1btn.isDisplayed()) {
        await cam1btn.click();
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ Clicked While using the app button",
            "level": "info"
          }
        }`);
        await driver.pause(1000);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "ℹ️ No While using the app button found",
          "level": "info"
        }
      }`);
    }
    await driver.pause(3000);
    // Handle permission
    try {
      const allowBtn = await driver.$('android=new UiSelector().className("android.widget.Button").text("Allow")');
      if (await allowBtn.isDisplayed()) {
        await allowBtn.click();
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ Clicked Android permission Allow button",
            "level": "info"
          }
        }`);
        await driver.pause(1000);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "ℹ️ No Allow permission dialog shown",
          "level": "info"
        }
      }`);
    }

    // Click capture
    try {
      const captureBtn = await driver.$('android=new UiSelector().className("android.widget.Button").text("CAPTURE")');
      await captureBtn.waitForDisplayed({ timeout: 5000 });
      await captureBtn.click();
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data":"📸 Capture button clicked",
          "level":"info"
        }
      }`);
    } catch (e) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data":"⚠️ Capture button not found",
          "level":"warn"
        }
      }`);
    }
    await driver.pause(5000);
    // Check if android.widget.ImageView exists
    try {
      const imageView = await driver.$('android=new UiSelector().className("android.widget.ImageView")');
      if (await imageView.isDisplayed()) {
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ ImageView is displayed",
            "level": "info"
          }
        }`);
      } else {
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "ℹ️ ImageView exists but not displayed",
            "level": "info"
          }
        }`);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "❌ ImageView not found",
          "level": "warn"
        }
      }`);
    }

  } catch (e) {
    await driver.execute(`browserstack_executor: {
      "action": "annotate",
      "arguments": {
        "data":"❌ Camera injection failed: ${e.message}",
        "level":"error"
      }
    }`);
  }
//-------------------------------------------------------------------------------------------
try {
    const imagePath = './test-image.jpeg';
    const mediaUrl = await uploadImage(imagePath);

    await driver.execute(
      `browserstack_executor: {
        "action": "cameraImageInjection",
        "arguments": {
          "imageUrl": "${mediaUrl}"
        }
      }`
    );
    await driver.pause(3000);
    try {
      const cam1btn = await driver.$('android=new UiSelector().className("android.widget.Button").text("CAMERA1 API")');
      if (await cam1btn.isDisplayed()) {
        await cam1btn.click();
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ Clicked Camera 1 button",
            "level": "info"
          }
        }`);
        await driver.pause(1000);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "ℹ️ No Camera 1 button found",
          "level": "info"
        }
      }`);
    }
    await driver.pause(3000);
    try {
      const cam1btn = await driver.$('android=new UiSelector().className("android.widget.Button").text("While using the app")');
      if (await cam1btn.isDisplayed()) {
        await cam1btn.click();
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ Clicked While using the app button",
            "level": "info"
          }
        }`);
        await driver.pause(1000);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "ℹ️ No While using the app button found",
          "level": "info"
        }
      }`);
    }
    await driver.pause(3000);
    // Handle permission
    try {
      const allowBtn = await driver.$('android=new UiSelector().className("android.widget.Button").text("Allow")');
      if (await allowBtn.isDisplayed()) {
        await allowBtn.click();
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ Clicked Android permission Allow button",
            "level": "info"
          }
        }`);
        await driver.pause(1000);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "ℹ️ No Allow permission dialog shown",
          "level": "info"
        }
      }`);
    }

    // Click capture
    try {
      const captureBtn = await driver.$('android=new UiSelector().className("android.widget.Button").text("CAPTURE")');
      await captureBtn.waitForDisplayed({ timeout: 5000 });
      await captureBtn.click();
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data":"📸 Capture button clicked",
          "level":"info"
        }
      }`);
    } catch (e) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data":"⚠️ Capture button not found",
          "level":"warn"
        }
      }`);
    }
    await driver.pause(5000);
    // Check if android.widget.ImageView exists
    try {
      const imageView = await driver.$('android=new UiSelector().className("android.widget.ImageView")');
      if (await imageView.isDisplayed()) {
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ ImageView is displayed",
            "level": "info"
          }
        }`);
      } else {
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "ℹ️ ImageView exists but not displayed",
            "level": "info"
          }
        }`);
      }
    } catch (_) {
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "❌ ImageView not found",
          "level": "warn"
        }
      }`);
    }

  } catch (e) {
    await driver.execute(`browserstack_executor: {
      "action": "annotate",
      "arguments": {
        "data":"❌ Camera injection failed: ${e.message}",
        "level":"error"
      }
    }`);
  }

  // ========== OTP FROM NOTIFICATIONS ==========
  try {
    // Get phone number (optional logging)
    const simInfo = await driver.execute(
      'browserstack_executor: {"action": "deviceInfo", "arguments": {"deviceProperties": ["simOptions"]}}'
    );
    if (simInfo?.["Phone Number"]) {
      const phoneNumber = simInfo["Phone Number"].replace(/^\+\d{1,3}\s?/, '');
      await driver.execute(`browserstack_executor: {
        "action": "annotate",
        "arguments": {
          "data": "📞 Phone Number: ${phoneNumber}",
          "level": "info"
        }
      }`);
    }

    // Clear notifications
    await driver.pressKeyCode(3);
    await driver.pause(1000);
    try {
      await driver.openNotifications();
      await driver.pause(2000);
      const clearBtn = await driver.$('android=new UiSelector().textContains("Clear")');
      await clearBtn.click();
    } catch (_) {}

    await driver.pause(60000); // Wait for SMS manually sent

    // Read OTP
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

      if (otp) {
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "✅ OTP Retrieved: ${otp}",
            "level": "info"
          }
        }`);
      } else {
        await driver.execute(`browserstack_executor: {
          "action": "annotate",
          "arguments": {
            "data": "❌ OTP not found",
            "level": "warn"
          }
        }`);
      }

      // Return to app/webview if needed
      const chromeContext = contexts.find(ctx => ctx.toLowerCase().includes('chrome'));
      if (chromeContext) {
        await driver.switchContext(chromeContext);
      }
    }

  } catch (e) {
    await driver.execute(`browserstack_executor: {
      "action": "annotate",
      "arguments": {
        "data":"❌ OTP test failed: ${e.message}",
        "level":"error"
      }
    }`);
  }

  await driver.deleteSession();
}

main().catch(console.error);
