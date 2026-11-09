package com.mobilepaymentssdkreactnative

import com.facebook.react.bridge.JavaOnlyMap
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

internal class PaymentParametersMappingTest {

  // JS numbers cross the bridge as doubles; JavaOnlyMap is React Native's JVM-only ReadableMap.
  private fun paymentParameters(delayDuration: Double? = null): JavaOnlyMap =
    JavaOnlyMap.of(
      "amountMoney", JavaOnlyMap.of("amount", 100.0, "currencyCode", "USD"),
      "processingMode", 1.0,
      "paymentAttemptId", "attempt-id",
      "autocomplete", false,
    ).apply { if (delayDuration != null) putDouble("delayDuration", delayDuration) }

  @Test
  fun delayDuration_seconds_isConvertedToMilliseconds() {
    assertEquals(3_600_000L, paymentParameters(3600.0).readPaymentParameters().delayDuration)
  }

  @Test
  fun delayDuration_fractionalSeconds_isConvertedToMilliseconds() {
    assertEquals(90_500L, paymentParameters(90.5).readPaymentParameters().delayDuration)
  }

  @Test
  fun delayDuration_aboveInt32Seconds_isNotTruncated() {
    assertEquals(3_000_000_000_000L, paymentParameters(3_000_000_000.0).readPaymentParameters().delayDuration)
  }

  @Test
  fun delayDuration_absent_isNull() {
    assertNull(paymentParameters().readPaymentParameters().delayDuration)
  }
}
