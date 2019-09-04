---
layout: post
title:  "Force Visual studio to build an APK for an Xamarin.Forms project"
categories: ["Software", "MSBuild", "Visual Studio"]
tags: ["xamarin", "testing", "msbuild", "visual studio" ]
draft: true
---

As I've elaborated in [this post](/copy-ipa-buildserver), I am trying to improve the internal QA of our software development team by introducing automated acceptance tests with [SpecFlow](https://specflow.org/) and [Appium](http://appium.io/). After succeeding to copy the iOS IPA on every build I faced the problem how to streamline the process for Android. The main issue was, that the `Build` target that is ran automatically does not build an `.apk`-file (*APK* in the following). The *APK* is built when the app shall be deployed to ad device, but not when the app is just built. 

### The `SignAndroidPackage` *MSBuild* target

Since the build process is definitely able to create an *APK* (see above), there has to be an *MSBuild* target for that, which I have been able to find in the `Xamarin.Android.Common.targets` file of Visual Studio (located in `C:\Program Files (x86)\Microsoft Visual Studio\2017\Professional\MSBuild\Xamarin\Android`). It's named `SignAndroidPackage` and is defined as

```xml
<Target Name="SignAndroidPackage" 
        DependsOnTargets="Build;Package;_Sign">
</Target>
```

Hence it's merely a meta-target that causes other targets to be executed in order to build the *APK* and does not contain any tasks on its own. Running 

```
msbuild -t:SignAndroidPackage path\to\android.csproj
```

builds the files `myApp.apk` and `myApp-Signed.apk`. The latter is the one signed with the default keystore and can be installed on a device.

**Side note:** The web also mentions the target `PackageForAndroid` to build an *APK*. Technically this is correct, since this target definitely builds an *APK*, but has proven unusable to me, since it only produces the unsigned `myApp.apk` file, which cannot be installed on a device. Anyway, this is useful for building an *APK* that shall be signed with a release keystore later, for example on a buildserver. This *APK* has to be zipaligned manually and then signed with `jarsigner`.

### Building the *APK* from Visual Studio

For quick iterations of my custom *MSBuild* target I created a `CustomTargets.targets` file. See [*Extending your iOS project file*](/copy-ipa-buildserver#extending-your-ios-project-file) on the details. It's pretty much the same for an Android project. Within that file I've defined a new `Target`

```xml
<Project>
    <Target Name="ForceBuildApk" 
            AfterTargets="Build" 
            DependsOnTargets="SignAndroidPackage">
    </Target>
</Project>
```

The `Name` attribute is mandatory for unambiguously identifying the target. This should have no value that is occupied by another target, since this would overwrite the existing target. 

By settings the `AfterTargets` attribute to `Build` the `ForceBuildApk` target is always run after the `Build` target is completed.

The `DependsOnTargets` attribute causes the `SignAndroidPackage` to be run before `ForceBuildApk` is run. Therefor - since `ForceBuildApk` is always run after `Build` - this target will force `SignAndroidPackage` to be run after `Build`, hence create our *APK* with each build, which is pretty much what I wanted to achieve.

### Wrap up

While (again) I thought, that this should be pretty straight-forward, building an *APK* automatically is something very scarce information can be found on. There are some resources, but they are scoped a bit differently, hence they served me little (besides pushing me in the right direction). Hopefully this post can fill that gap and will be useful for someone else.
