import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
import FBSDKCoreKit
import GoogleSignIn

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    ApplicationDelegate.shared.application( // <-- Facebook SDK init
         application,
         
         didFinishLaunchingWithOptions: launchOptions
       )

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "MyCrush3",
      in: window,
      launchOptions: launchOptions
    )
    FirebaseApp.configure()
    showSplashScreen()
    return true
  }

    //Add below method in AppDelegate.swift
    private func showSplashScreen() {
      if let splashClass = NSClassFromString("SplashView") as? NSObject.Type,
          let splashInstance = splashClass.perform(NSSelectorFromString("sharedInstance"))?.takeUnretainedValue() as? NSObject {
          splashInstance.perform(NSSelectorFromString("showSplash"))
          print("✅ Splash Screen Shown Successfully")
      } else {
          print("⚠️ SplashView module not found")
      }
    }

    func application(
            _ app: UIApplication,
            open url: URL,
            options: [UIApplication.OpenURLOptionsKey : Any] = [:]
          ) -> Bool {
            return ApplicationDelegate.shared.application(app, open: url, options: options)
          }
}

func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
  // Handle Google Sign-In URL
  if GIDSignIn.sharedInstance.handle(url) {
    return true
  }

  // Add other URL handlers if you have them
  // if RCTLinkingManager.application(app, open: url, options: options) {
  //   return true
  // }

  return false
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
