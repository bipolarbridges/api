CREATE (:User{uid: "client0@email.com"});

CREATE (:Resource{path: "/client"});
CREATE (:Resource{path: "/measurement"});
CREATE (:Resource{path: "/"});

CREATE (:Identity{
    type: "key",
    name: "test_export_key",
    check: "d4f79b313f8106f5af108ad96ff516222dbfd5a0ab52f4308e4b1ad1d740de60"
    });

MATCH (i:Identity{name: "test_export_key"})
    MATCH (r:Resource{path: "/client"})
    CREATE (i)-[:Can{method: "POST"}]->(r);
MATCH (i:Identity{name: "test_export_key"})
    MATCH (r:Resource{path: "/measurement"})
    CREATE (i)-[:Can{method: "POST"}]->(r);

MATCH (u:User{uid: "client0@email.com"}) 
    CREATE (r:Resource{path: "/client/client0@email.com"})
    CREATE (u)-[:Can{method: "GET"}]->(r);
