---
published: false
---


I just read [ZooKeeper: Distributed Process Coordination](http://smile.amazon.com/ZooKeeper-Distributed-Coordination-Flavio-Junqueira/dp/1449361307/). Here are some notes.

There are two ways to look at any software framework: what abstractions/interface it provides and how it works internally.

The abstraction presented by Zookeeper is a tree of nodes (called znodes), and a number of operations with useful guarantees.  
Nodes can be persistent or ephemeral (they get deleted when the session of the client who created the node is terminated or expires). The path of a node is set by the client, but ZooKeeper can optionally generate a sequence number (for example: /tasks/task-<increment>).  
So a node has a path, some typically small data, a mode (persistent or ephemeral), a version and some ACLs.  
The operations are to create a node, delete a node, check for existence of a path, read a node, replace the data with newer data, and enumerate the children of a path. There is also the multi-operation which is a combo of operations that only succeed atomically.  
Changes to a node are versioned (but the version get lost/reset whenever the node is deleted) and some operations can be executed conditionally on an expected version.  
Rather than polling to watch for changes, a client can set 'watches'. Those will provide a one-time notification (the watch needs to be reset every time it fires) when the monitor node is created, changes, or is deleted. The watch is an option on other operations. 

Ordering guarantees:
Write operations are globally ordered, and they will be observed in that order by any one client. 
This includes notifications. A watch notification is guaranteed to be delievered to its watchers before any other changes are allowed.

In terms of deployment, ZooKeeper can be run as a standalone instance or as an ensemble (making decisions by quorum). It is accessed with a client library which handles the connections and re-connections. The client will connect to any of the instance, with an order of priority. There is also a CLI client and higher-level libraries (Curator) to encapsulate common recipes and usage patterns.

Although the abstraction seems powerful, distributed systems necessarily have tricky cases. The book does a good job at warning ZooKeeper users of such cases. For instance, classes of recoverable and non-recoverable errors. Or how a client should check the freshness of a server (last version seen) upon re-connection. Or the danger of watching for the creation of an ephemeral node (you might miss it in case of disconnects). Or the difficulty of knowing whether a sequential node was successfully created in the event of a disconnection.

Going into the internal design and ZooKeeper's consensus protocol, I felt the book didn't explain the success scenario clearly enough before jumping to various error cases.
At a very high level, there are two types of ZooKeeper servers: core servers (which can be in one of multiple states: Looking, Leading or Following) and observers (used for scalability). The core servers in Looking state (after startup or after losing heartbeat from the previous Leader) will elect a Leader. Each time a new Leader is elected, a new epoch starts and the epoch number is incremented (it figures in transaction identifiers).  
The Leader acts as sequencer for all write requests, passing them on as transaction proposals to Followers. A quorum of Followers (3 out of 5, for instance) is required for a proposal to get accepted and committed.  
All servers can handle read requests locally, as each server keeps a transaction log and a snapshot of the latest tree (that it knows about).
I'm still working my way down the rabbit hole of consensus protocols, which are notoriously subtle. Here is an excellent list of [references and summaries of most important consensus papers](http://blog.acolyer.org/2015/03/01/cant-we-all-just-agree/).


![Zookeeper Oreilly book]({{site.baseurl}}/archives/images/zookeeper.jpg)
