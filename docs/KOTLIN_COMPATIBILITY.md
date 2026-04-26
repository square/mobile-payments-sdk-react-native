# Kotlin 2.2.x Compatibility Workaround for React Native

Mobile Payments SDK 2.5.0 requires **Kotlin 2.2.21**, which introduces a breaking change with React Native's Gradle plugin (versions 0.75.x and earlier). The `KotlinTopLevelExtension` class was removed in Kotlin 2.2.x, causing the Android build to fail during Gradle configuration.

This guide explains how to apply a patch to your project so you can use Mobile Payments SDK 2.5.0 with React Native until React Native itself adds support for Kotlin 2.2.x.

> **Note:** This workaround is temporary. Once React Native releases a version with Kotlin 2.2.x support, you can remove the patch and `patch-package` dependency.

## The Problem

When building with Kotlin 2.2.21, Android builds fail with an error like:

```
Unresolved reference: KotlinTopLevelExtension
```

This happens because React Native's Gradle plugin (`@react-native/gradle-plugin`) references `org.jetbrains.kotlin.gradle.dsl.KotlinTopLevelExtension`, which was removed in Kotlin 2.2.x and replaced with `kotlinExtension`.

## Fix: Apply a Patch with `patch-package`

### 1. Install `patch-package`

```sh
# npm
npm install --save-dev patch-package

# yarn
yarn add --dev patch-package
```

### 2. Add a `postinstall` script

In your project's `package.json`, add a `postinstall` script so the patch is applied automatically after every install:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

If you already have a `postinstall` script, chain the commands:

```json
{
  "scripts": {
    "postinstall": "your-existing-command && patch-package"
  }
}
```

### 3. Create the patch file

Create the file `patches/@react-native+gradle-plugin+0.75.3.patch` in your project root.

> **Important:** The version in the filename (`0.75.3`) must match your `react-native` version. If you are on a different version (e.g., `0.75.4`), adjust the filename accordingly.

```sh
mkdir -p patches
```

Paste the following contents into `patches/@react-native+gradle-plugin+0.75.3.patch`:

```diff
diff --git a/node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/JdkConfiguratorUtils.kt b/node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/JdkConfiguratorUtils.kt
index 0d55714..e59e9d5 100644
--- a/node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/JdkConfiguratorUtils.kt
+++ b/node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/JdkConfiguratorUtils.kt
@@ -13,7 +13,7 @@ import org.gradle.api.Action
 import org.gradle.api.JavaVersion
 import org.gradle.api.Project
 import org.gradle.api.plugins.AppliedPlugin
-import org.jetbrains.kotlin.gradle.dsl.KotlinTopLevelExtension
+import org.jetbrains.kotlin.gradle.dsl.kotlinExtension

 internal object JdkConfiguratorUtils {
   /**
@@ -42,10 +42,10 @@ internal object JdkConfiguratorUtils {
       project.pluginManager.withPlugin("com.android.application", action)
       project.pluginManager.withPlugin("com.android.library", action)
       project.pluginManager.withPlugin("org.jetbrains.kotlin.android") {
-        project.extensions.getByType(KotlinTopLevelExtension::class.java).jvmToolchain(17)
+        project.kotlinExtension.jvmToolchain(17)
       }
       project.pluginManager.withPlugin("org.jetbrains.kotlin.jvm") {
-        project.extensions.getByType(KotlinTopLevelExtension::class.java).jvmToolchain(17)
+        project.kotlinExtension.jvmToolchain(17)
       }
     }
   }
```

### 4. Run install to apply the patch

```sh
# npm
npm install

# yarn
yarn install
```

You should see output confirming the patch was applied:

```
patch-package 8.0.1
Applying patches...
@react-native/gradle-plugin@0.75.3 ✔
```

### 5. Build your project

Your Android build should now succeed with Kotlin 2.2.21 and Mobile Payments SDK 2.5.0.

## Removing the Workaround

When React Native releases a version that supports Kotlin 2.2.x natively:

1. Upgrade your `react-native` dependency to the compatible version
2. Delete the `patches/@react-native+gradle-plugin+0.75.3.patch` file
3. Remove `patch-package` from your `devDependencies` (if no other patches remain)
4. Remove `patch-package` from your `postinstall` script

## Reference

- [Mobile Payments SDK React Native Example](../example/) - see how the patch is applied in the sample project
- [patch-package documentation](https://github.com/ds300/patch-package)
