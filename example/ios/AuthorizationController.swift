//
//  AuthorizationController.swift
//  MobilePaymentsSdkReactNativeExample
//
//  Created by Nilay Gupta on 03/10/24.
//

import UIKit
import SquareMobilePaymentsSDK

class AuthorizationController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
  func authorizeMobilePaymentsSDK() {

          // Check if the SDK is not already authorized
          guard MobilePaymentsSDK.shared.authorizationManager.state == .notAuthorized else {
              print("Already authorized.")
              return
          }

          // Authorize the SDK
          MobilePaymentsSDK.shared.authorizationManager.authorize(
              withAccessToken: $SQUARE_READER_SDK_ACCESS_TOKEN,
              locationID: $SQUARE_READER_SDK_LOCATION_ID
          ) { error in
              if let authError = error {
                  // Handle authorization error
                  print("Authorization errorrrrr: \(authError.localizedDescription)")
                  return
              }

              print("Square Mobile Payments SDK successfully authorized.")
              // You can proceed with other operations after successful authorization
          }
      }
    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
