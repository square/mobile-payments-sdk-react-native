import Foundation
import SquareMobilePaymentsSDK
import MockReaderUI
import React

@objc(MockReaderModule)
class MockReaderModule: NSObject, RCTBridgeModule {
    // Specify the module name for React Native
    static func moduleName() -> String {
        return "MockReaderModule"
    }
  
    private lazy var mockReaderUI: MockReaderUI? = {
        do {
            return try MockReaderUI(for: MobilePaymentsSDK.shared)
        } catch {
            assertionFailure("Could not instantiate a mock reader UI: \(error.localizedDescription)")
            return nil
        }
    }()

    @objc
    func presentMockReaderUI() {
        // Attempt to present the Mock Reader UI on the main thread
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            try? self.mockReaderUI?.present()
        }
    }
}
