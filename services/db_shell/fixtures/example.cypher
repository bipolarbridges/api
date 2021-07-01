// Set up basic client references
CREATE (:User{uid: 1});
CREATE (:User{uid: 2});

// Syntax to log a user measurement at a certain time

MATCH (u:User {uid:1})
    MERGE (m:MeasurementType {name: "sentiment"})-[:Includes]->(v:Measurement{value: 0.5})
    MERGE (s:Source{name: "measurement"})-[:Includes]->(m)
    MERGE (v)-[:RecordedOn]->(d:Date{day:1, month:1, year:2021})
    MERGE (v)-[:RecordedAt]->(h:Hour{time: 6175})
    MERGE (u)-[:Recorded]->(m);

// An additional record for the same user on a different day
MATCH (u:User{uid:1})
    MERGE (m:MeasurementType {name: "sentiment"})-[:Includes]->(v:Measurement{value: 0.7})
    MERGE (s:Source{name: "measurement"})-[:Includes]->(m)
    MERGE (v)-[:RecordedOn]->(d:Date{day:2, month:1, year:2021})
    MERGE (v)-[:RecordedAt]->(h:Hour{time: 6175})
    MERGE (u)-[:Recorded]->(m);
    

// Different user, different type of measurement
MATCH (u:User{uid:2})
    MERGE (m:MeasurementType {name: "heartrate"})-[:Includes]->(v:Measurement{value: 70})
    MERGE (s:Source{name: "measurement"})-[:Includes]->(m)
    MERGE (v)-[:RecordedOn]->(d:Date{day:1, month:1, year:2021})
    MERGE (v)-[:RecordedAt]->(h:Hour{time: 6375})
    MERGE (u)-[:Recorded]->(m);