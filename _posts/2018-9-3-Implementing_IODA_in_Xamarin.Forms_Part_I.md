---
layout: post
title:  "Implementing the IODA in Xamarin.Forms - I the basics"
category: "Software"
tags: ["architecture", "clean code"]
---

Today I'd like to talk about how I implemented the IODA in a Xamarin.Forms app with Prism. The IODA (Integration Operation Data Architecture) is an architecture based on the Integration Operation Segregation Principle, proposed by the german [Clean Code Developer Initiative](http://clean-code-developer.de/) ([🇬🇧](http://clean-code-developer.com/)). In this first post I will explain the basics (briefly) to elaborate how we implemented it in our Xamarin.Forms app in the follow-up posts. 

### The Integration Operation Segregation Principle (IOSP)

> If a method contains both logic and calls to other methods, the total behavior will be no longer clear. The instructions are blurred over a possibly very deep hierarchy. Furthermore this kind of method has a tendency to grow unlimited. ([Source](http://clean-code-developer.com/grades/grade-1-red/#Integration_Operation_Segregation_Principle_IOSP))

The solution is to keep integration and operations separate from each other. 

- Integrations
  - calls to other methods from the same codebase
  - *very* simple decision and flow structures with no own domain logic (all domain logic has to be encapsulated)
- Operations
  - Domain logic
  - Framework calls 
  
A strict adherance to the IOSP will push all logic to the edges with no dependencies to other operations, keeping the operations brief and - even more important - testable. The integrations on the other hand will stay straightforward and readable, since they are not cluttered with any logic.

```csharp
if(IsNewCustomer(customer))
{
    repository.StoreCustomer(customer);
}
repository.StoreOrderForCustomer(order, customer);
```

The logic, how to determine whether a customer is a new customer or an existing one is transparent. This integration does not need to know abou *how* this is done, but rather how to handle the result. 

Anyway, the method `IsNewCustomer` may itself be an integration that first tries to load a customer by whatever criteria and then tests whether the loaded customer is *really* the same.

```csharp
private bool IsNewCustomer(customer)
{
    var existingCustomer = repository.LoadCustomerByEMailAddress(customer.EMailAddress);
    return customerLogic.IsValidCustomer(existingCustomer);
}
```

While the logic may be a bit contrived (I could not use our actual code for legal reasons), the point should be clear. `IsNewCustomer` is not cluttered at all with low-level decistions, but integrates methods on a high level to create the larger scale behavior of the app. 

You might argue that `IsValidCustomer` actually *has* a dependency to an object from the same codebase (and so have `LoadCustomerByEMailAddress` and our other repository methods), but this is not a functional dependency. The `Customer` class is a pure **data** class with no logic on it's own.

### The Integration Operation Data **A**PI Architecture (IODA)

While the IOSP can be seen as a principle that reflects itself in the design of methods (and classes to some extent), the IODA takes the principle to a higher level. 

[![IODA Architecture schematic image][1]][2]

[1]: http://lh4.ggpht.com/-VN9jIkfjGwk/VSlTdR4lNkI/AAAAAAAAFEs/qFMekxNNpcQ/image%25255B50%25255D.png?imgmax=800
[2]: http://blog.ralfw.de/2015/04/die-ioda-architektur.html
