---
layout: post
title:  "Angular App in Azure - Part II: Azure Web App and DevOps"
category: "Software"
tags: ["architecture", "azure", "angular"]
draft: true
---

[Part I: Project outline](/azure-angular)

This is the second blog post in my series about taking an Angular App to Azure. In my first blog post I gave a general [outline of the project](/azure-angular) now I'd like to write about how I employed hosting in an Azure Web App and about the Azure DevOps Pipelines to build and deploy the app.

While I do have *some* code, yet, my backend code is but stubs that were created as examples by .NET Core. I don't think that posting any of it here will be helpful for anyone, hence this post will still be low on code. This will probably change with the following posts. 

* * *

## Azure Web App

There are resources online on how to create a Azure Web App, for example [here][create web app], therefor I will not explain how you can create a Web App in Azure, but focus on the configuration required for this project. To be repeated: The frontend of the website will be created with Angular, the backend with .NET Core web services. Mauricio Trunfio wrote a great article (to be found [here][host angular app]) on how to deploy an Angular app to Azure. 

### The web.config file

A *very* basic Angular App would run on an Azure Web App with (virtually) no configuration. Anyway, as soon as routing comes into play, you will have sorrow. Therefor you'll need a *web.config* file for your Angular project, that will cause all routes to fallback to *index.html* (see [here][angular iis configuration] for an in-depth explanation). Your *web.config* will have to look like this (hold on, this is not the final version, yet)

*** xml
<configuration>
    <system.webServer>
      <rewrite>
        <rules>
          <rule name="Angular" stopProcessing="true">
            <match url=".*" />
            <conditions logicalGrouping="MatchAll">
              <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
              <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            </conditions>
            <action type="Rewrite" url="/" />
          </rule>
        </rules>
      </rewrite>
    </system.webServer>
</configuration>
***

### Where does my API go?

Since I had a hard time deploying both my API and the Angular App to the same virtual application in my Azure Web App, I decided to deploy the API to another virtual application, named `/api`. To set up the virtual application, just visit *Settings&nbsp;&gt;&nbsp;Application settings* and scroll down to *Virtual applications and directories*.

![Virtual Application configuration](/images/azure_web_app_virtual_applications.png)

I've chosen the path *site\api* as the physical location of the application, but you are quite free to choose whatever you deem appropriate ([^1]). 

## Footnotes

[^1]: I would like to remind the kind reader that I do not deem my solution the best one at any rage. What I present here is what worked best **for me** and I sincerely hope, that my explanations might help anyone, but if there is anything that can be improved, please feel free to contact me (see the footer of this page for my Twitter).

[create web app]: https://docs.microsoft.com/en-us/azure/app-service/app-service-web-get-started-dotnet
[host angular app]: https://itnext.io/easy-way-to-deploy-a-angular-5-application-to-azure-web-app-using-vsts-pipelines-4a288b9deae1
[angular iis configuration]: https://angular.io/guide/deployment#server-configuration