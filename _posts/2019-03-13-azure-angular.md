---
layout: post
title:  "Angular App in Azure - Part I: Project outline"
category: "Software"
tags: ["architecture", "azure", "angular"]
draft: true
---

Developers love coffee and of course they love to explore new technologies (well, at least I do). I combined both and proudly present to you: *CoffeeFriends*. *CoffeeFriends* is a website ([^1]) to track your coffee consumption together with your peers. Like a social network ... with coffee.

I mainly started this project, to brush up my Angular and Azure skills. The tech stack will be 

- Angular (with Material) for the front-end
- .NET Core web services for the back-end
- Azure AD B2C will serve for the user authentication
- Azure Web App for Serving both front- and back-end and
- Azure DevOps Pipelines for CI/CD

Since I want to spin up a *kind of* complete CI/CD process, you will eventually always find the current version at https://coffeefriends.azurewebsites.net. Please bear with me, since I just started the project, it's not that much, yet. Just come back later. I'd like to reiterate that I'm not providing a service. This is just a pet project of mine and there won't be any guarantees or liabilities. I might shut down the website at any time, wipe all the data or do whatever I'd like to with it ([^2]). If it is down and you are interested in seeing the page in action, drop me a message (see contact options below).

During the development of the website I will try and write blog posts about certain aspects of the project, why I did what I did and how issues I encountered on my way have been solved. Since most of the tech stack is quite new to me, I will always be happy about comments, via pull-requests, Twitter, pigeon post, whatsoever. 

The next posts will be about Hosting and Azure DevOps Pipelines and using Azure AD B2C for authentication. Stay tuned.

### Footnotes

[^1]: I itentionally avoid the word service, since this would make me kind of a service provider with all the bells and whistles and this is definitely **not** what I want, while I invite everyone to try it out at https://coffeefriends.azurewebsites.net
[^2]: Well, there might be laws, keeping me from doing whatever I'd like to and I plan to obey. Anyway, within the limits of applicable laws, I might do whatever I'd like to.