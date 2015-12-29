---
published: false
---

http://smile.amazon.com/ZooKeeper-Distributed-Coordination-Flavio-Junqueira/dp/1449361307/


Notes on ZooKeeper:
Presents the abstraction of a tree of nodes (called znodes), and a number of operations with useful guarantees.
Nodes can be persistent or ephemeral (they get deleted when the session of the client who created the node expires or explicitly terminates). The path of a node is set by the client, but ZooKeeper can optionally generate a sequence number (/tasks/task-***).
So a node has a path, some (small) data, a mode (persistent or ephemeral), a version and some ACLs.
The operations are to create a node, delete a node, check for existence of a path, read a node, replace the data with newer data, and enumerate the children of a path. There is also the multi-operation (a combo of operations which only succeed atomically).
Changes to a node are versioned (but the version get lost/reset whenever the node is deleted) and some operations can be executed conditionally on an expected version.
Rather than polling to watch for changes, a client can set 'watches'. Those will provide a one-time notification (the watch needs to be reset every time it fires) when the monitor node is created, changes, or is deleted. The watch is an option on other operations. 

Ordering guarantees:
Write operations are globally ordered, and they will be observed in that order by any one client. 
This includes notifications. A watch notification is guaranteed to be delievered to its watchers before any other changes are allowed.
There are many tricky scenarios, which the ZooKeeper design tries to handle as best it can. For instance, upon re-connection, a client needs to verify that the new server sees at least as fresh a version as the client last saw. Also, it is dangerous to watch for the creation of an ephemeral node, as you might miss it in case of disconnects. Or there can be difficulties knowing whether a sequential node was successfully created in the event of a connection loss error.


Behind the scene, ZooKeeper can be run as a standalone instance or as an ensemble (making decisions by quorum). It is accessed with a client library which handles the connections and re-connections. The client will connect to any of the instance, with an order of priority. There is also a CLI client and higher-level libraries (Curator) to encapsulate common recipes and usage patterns.
Internally, the ensemble picks a leader which acts as sequencer and proposer to followers.

