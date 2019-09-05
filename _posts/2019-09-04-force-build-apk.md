---
layout: post
title:  "Force Visual studio to build an APK for every build of a Xamarin.Android project"
categories: ["Software", "MSBuild", "Visual Studio"]
tags: ["xamarin", "testing", "msbuild", "visual studio" ]
draft: true
---

As I've elaborated in [this post](/copy-ipa-buildserver), I am trying to improve the internal QA of our software development team by introducing automated acceptance tests with [SpecFlow][specflow] (and [Appium][appium] for our app). After succeeding to copy the iOS IPA on every build I faced the problem how to streamline the process for Android, particularly how to build an `.apk`-file (*APK* in the following) although the app is not deployed to a device.

<!--more-->

### Android *MSBuild* Targets

**MSBuild Targets**: *"Targets group tasks together in a particular order [...]"* ([MSBuild Target documentation][target]

There are tons of `.targets`-files shipped with Visual Studio that define the targets that are executed during the build process. Depending on the type of the project, a project imports usually one `.targets`-file taylored for the needs of that very project type. Usually (as far as I've seen this far) there is a `Build` target for the main build action. This would for example build the .NET Framework `.exe`-file for a windows console application. However, whilst an *APK* is created when deploying the app to a physical device, the `Build` target of a *Xamarin.Android* project won't (for build performance reasons). It'll create `.dll`- and `.pdb`-files (at least in *Debug* configuration) and some more, but no *APK*.

Since the build process is definitely able to create an *APK* (see above), there has to be an *MSBuild* target for that purpose, which I have been able to find in the `Xamarin.Android.Common.targets` file located in `C:\Program Files (x86)\Microsoft Visual Studio\2017\Professional\MSBuild\Xamarin\Android`. It's named `SignAndroidPackage` and is defined as

```xml
<Target Name="SignAndroidPackage" 
        DependsOnTargets="Build;Package;_Sign">
</Target>
```

Hence it's merely a meta-target that causes other targets to be executed in order to build the *APK* and does not contain any tasks on its own. Executing

```
msbuild -t:SignAndroidPackage path\to\android.csproj
```

builds the files `myApp.apk` and `myApp-Signed.apk`, where the latter is the one signed with the default debugging keystore and can be installed on a physical device. While I could run *MSBuild* with this target in the pre-build events of my test project, it would impede my testing process (been there, done that), which I'd like to avoid. Hence this is not an option for me.

Anyway, calling this target from another target that is run after `Build` causes errors that circular dependencies between targets have been detected. For this reason, we cannot use `SignAndroidPackage` itself. However we can make use of its definition, as you can see the [next section](#building-the-apk-from-visual-studio).

**Side note:** The web also mentions the target `PackageForAndroid` to build an *APK*. Technically this is correct, since this target definitely builds an *APK*, but has proven unusable (cumbersome at least) to me, since it only produces the unsigned `myApp.apk` file, which cannot be installed on a physical device. Anyway, this can be useful for building an *APK* that shall be signed with a release keystore later, for example on a buildserver. This *APK* has to be zipaligned manually and then signed with `jarsigner`.

### Building the *APK* from Visual Studio

For quick iterations of my custom *MSBuild* target I created a `CustomTargets.targets` file within my Android project. See [*Extending your iOS project file*](/copy-ipa-buildserver#extending-your-ios-project-file) on the details. It's pretty much the same for an Android project. Within that file I've defined a new `Target`

```xml
<Project>
    <Target Name="ForceBuildApk" 
            AfterTargets="Build">
            <CallTarget Targets="Package;_Sign" />
    </Target>
</Project>
```
The `Project` element is required to import the `.targets`-file from your Android project file.

The `Name` attribute in the `Target` is mandatory for identifying the target unambiguously. This should have no value that is occupied by another target, since this would overwrite the existing target.

By settings the `AfterTargets` attribute to `Build`, the `ForceBuildApk` target is always run once the `Build` target has finished.

Within the target, there is a `CallTarget` element, which basically does what its name suggest: It calls another target (actually more than one if necessary). The `Targets` attribute takes a semicolon-separated list of targets that shall be called, `Package` and `_Sign` in this case (remember that `ForceBuildApk` is run after `Build`, hence we don't need to call the `Build` target).

#### Deleting the existing *APK*s

Whilst this builds a signed *APK* when the project is built, it - for some reason - won't overwrite an existing *APK*. I've decided that it would be the easiest to simply delete the existing *APK*s before packaging and signing them. Therefor I've set up another target 

```xml
<Target Name="CleanApk">
      <Delete Files="$(OutDir)$(_AndroidPackage)-Signed.apk" />
      <Delete Files="$(OutDir)$(_AndroidPackage).apk" />
</Target>
```

and added this to the `CallTarget` task

```xml
<CallTarget Targets="CleanApk;Package;_Sign" />
```

to delete the *APK* before it is created.

The `Delete`-task should be pretty self-explanatory. It deletes one or more files. The `$(OutDir)` variable contains the (relative) path the build products are written to (e.g. `bin\\Debug\\`) ahd `$(_AndroidPackage)` the Android package name (e.g. `com.sld.myapp`). If the file to delete does not exist, `Delete`-task emits a message, but won't fail. To avoid that the signed *APK* is created from an outdated unsigned *APK* the latter is deleted, too.

This way, my *APK* is built whenever I build my project. Although there is some build time overhead, this has been the best trade-off for me to have my *APK* ready for SpecFlow testing.

### Wrap-up

Whilst (again) I thought, that this should be pretty straight-forward, building an *APK* automatically is something very scarce information can be found on. There are some resources, but they are scoped a bit differently (quite some towards build servers), hence they served me little (besides pushing me in the right direction). Hopefully this post can fill that gap and will be useful for someone else.

[specflow]: https://specflow.org/
[appium]: http://appium.io/
[target]: https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild-targets?view=vs-2019
