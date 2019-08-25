---
layout: post
title:  "Visual Studio 2017: Copying the Xamarin.iOS IPA file on the macOS buildserver with an MSBuild target"
categories: ["Software", "MSBuild"]
tags: ["xamarin", "testing", "msbuild" ]
---

I am currently in the process of implementing an improved software quality pipeline incorporating automated end-to-end tests for our software development team. (At the moment the tests are run manually by our QA department, which is quite time-consuming.) As a proof of concept, I am implementing automated tests with [SpecFlow](https://specflow.org) and [Appium](http://appium.io) for our app project. In order to run the tests for the most recent version of the iOS app, I'd like to copy the latest `.ipa` file (I'll refer to this file as *IPA* in the following) to a specific directory to run the tests on this very build. This seems to be quite an uncommon task, since there is scarce information to be found on it online and the information I have been able to find is outdated or incomplete or both. 

**Remarks:** The information provided holds if you build the iOS app from *Visual Studio* on a Windows development machine using a macOS build server. Supposedly the procedure is easier when building from *Visual Studio for Mac*, but I don't have any sound information on this issue. Furthermore I am assuming Visual Studio 2017, but having looked at the relevant files in Visual Studio 2019, I'd guess that it would work the same way.

### Extending your iOS project file 

**MSBuild Targets**: *"Targets group tasks together in a particular order [...]"* ([MSBuild Target documentation](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild-targets?view=vs-2019))

We'll be using a target for *MSBuild* in order to copy our IPA once it is built. While you *could* implement the user defined target directly in your iOS apps `.csproj` file, I'd advise you *not* to, simply for the reason that it's easier to edit an imported `.targets` file, than the project file. Whenever you try to troubleshoot something, you'll thank me for that advise. I would ;)

Add a new file, named `CustomTargets.targets` to your iOS project (the name ain't that important, though, but it has to have *any* name), which we will later use to define our target. Since we'll need a root XML-tag anyway, add the following lines to the file (custom target files are *projects* in the lingo of *MSBuild*, don't care about it too much, we'll need this to import the file from our actual project file)

```xml
<Project>
</Project>
```

Save the iOS project and unload it, in order to load the project file (of the iOS project) in the editor. Add the following line (basically somewhere, but I personally prefer the end of the file, just before the `</Project>` tag):

    <Import Project="CustomTargets.targets" />
	
This will import the `.targets` file, which will render the custom targets we define within that file available for our build process. Now you may reload the iOS project file.

### Implementing the custom target to copy the IPA 

While the target is not that complicated (actually not complicated at all) this has been the tricky part, which brought me close to desparation. I'll first present the complete code and then dissect it line by line for an in-depth explanation.

`CustomTargets.targets`: 

```xml
<Project>
  <UsingTask TaskName="Microsoft.Build.Tasks.Copy" AssemblyFile="Xamarin.iOS.Tasks.dll"/>
  <Target Name="CopyIpa" AfterTargets="_CoreArchive">   
    <Copy SessionId="$(BuildSessionId)" 
          SourceFiles="$(IpaPackagePath)" 
          DestinationFiles="/Users/[username]/Appium/CurrentBuild.ipa" 
          ContinueOnError="true" />
  </Target>
</Project>
```
	
#### In-depth explanation

Since I've already explained it above, I'll omit the `<Project>` and `</Project>` lines.

    <UsingTask TaskName="Microsoft.Build.Tasks.Copy" AssemblyFile="Xamarin.iOS.Tasks.dll"/>
	
This imports the `Copy` task from `Xamarin.iOS.Tasks.dll`. Without this line, *MSBuild* would use the default `Copy` task, which would attempt to copy files on our local machine, but we'd like to copy a file that lives on the build server to another folder on the same machine. 

```xml
<Target Name="CopyIpa" AfterTargets="_CoreArchive">  
```
	
This defines a new build target, i.e. a series of tasks that can be executed during the build process. The `Name` attribute is mandatory and should be unique within the whole build process. Otherwise, the target with the same name would be overwritten.

The `AfterTargets` attribute is not mandatory in the sense of *MSBuild*, but crucial anyway. This determines at which stage of the whole build process the target will be executed. I've first used `AfterTargets="Build"` which causes the target to be ran after the build process has finished. Anyway, this caused a build error, since the session with the build server is already destroyed at this point. Executing after target `_CoreArchive` has proven workable, since at this point the IPA has been created and the session is still alive, but this might change with future Xamarin versions.
	
```xml
<Copy SessionId="$(BuildSessionId)" 
      SourceFiles="$(IpaPackagePath)" 
      DestinationFiles="$(Home)/Appium/CurrentBuild.ipa" 
      ContinueOnError="true" />
```
	
This task copies a file on the build server (see above). Files paths may be relative (to the current build folder) or absolute. 

`SessionId="$(BuildSessionId)"` sets the `SessionId` parameter of the task, which is required for the connection to the build server. `$(BuildSessionId)` is a variable that is set previously in the build process (from one of the default Xamarin build targets). Again, this might change in future releases, since this is not officially documented. (You might have a look at the `.targets` files within the `C:\Program Files (x86)\Microsoft Visual Studio\2017\Professional\MSBuild\Xamarin\iOS` directory, especially `Xamarin.iOS.Common.targets`.)

`SourceFiles="$(IpaPackagePath)"` sets the file to copy. `$(IpaPackagePath)` is set by the default Xamarin build process, too, and points to the path where the generated IPA is located.

`DestinationFiles="/Users/[username]/Appium/CurrentBuild.ipa" ` determines the location where the files shall be moved to. Unfortunately the homedir of the build user is not available (easily) in *MSBuild*, hence I've used the full path of my home dir. 

**Please note**: `[username]` has to be replaced by your actual username. So for me the full path would be `/Users/kertscher/Appium/CurrentBuild.ipa`. (I am currently determining whether there is a way to determine the homedir automatically.)

By setting `ContinueOnError` to `true` we tell *MSBuild* to continue the build process if the task fails. This came quite handy during the development of the target, but is not necessary at all. Feel free to omit this. If it is enabled and this task fails for whatever reason, *MSBuild* will give a warning instead of an error.

```
</Target>
```

This ends the target. Just for sake of completeness.

### Wrap-up

In this post I've presented a method to copy the IPA on the Xamarin.iOS macOS buildserver to another directory, to be able to run automated tests on the current version of the app. Since I have not been able to determine the homedir of the builduser, the directory the IPA will be moved to has to be entered manually, but I'm working on a method to determine the homedir automatically, stay tuned. Anyway hopefully there is someone out there, this information is useful to and I'll spare them hours of research on how to achieve this.
