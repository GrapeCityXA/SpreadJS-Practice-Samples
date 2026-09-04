import * as GC from "@grapecity-software/spread-sheets";

// GC.Spread.Sheets.Designer.LicenseKey = "GrapeCity-Internal-Use-Only,E355896284189812#B1M13dpBlIbpjInxmZiwSZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34TUUhFMMNzdNpkVu3CNZ5kQmpFRyAzYilFeTNEcWp6QHZ7NXVXRKdTdXFWYLlWWBN6Kv2We9MDNS3Ce63ydlFme6cHeFtGMGZWUOdVZi3kcwFlMyhFREFnbrlzR4tET5oGajdmMpFXMkR6QMpWR8gHbJ54LCd6Qz36b7Z7RGVDcuNleiB7UvAVcnJmcWhnQIRUWYtERCNWYQ94RqlmTzc7Tvt4M8d6UoF6KqJ5aPVUUG9mWKZncON6LMdlbv8keX9UWsJnc9UlVyNlcQRmT63SRKJDdshWQJdzNoJDbM5GZjJmWYJDOy44dpxGOyVzRjV6Q8EUTRlHWyd4d72UTQh7U8gUZLllTE9EeuZWRpJzZZdjRZRlVGFmd4IVcZV6QmRkQzxEMMdlVB96MGpXdH9WazZFNsdUeLdzc8Bjcj9UT4lXOTdXb8tiSzU5Qv2EdWRGOCZGR7ZlI0IyUiwiIwEDOEVUQ7cjI0ICSiwCO9YDNxMDMxgTM0IicfJye#4Xfd5nILRVOGJiOiMkIsISOx8idgkiTDhibvRGZB5icl96ZpNXZE5yUKRWYlJHcTJiOi8kI1tlOiQmcQJCLiMDNzMTMwACOwUDM6IDMyIiOiQncDJCLiMXduMXdpN6cl5mLqwCcvRnLzVXajNXZt9iKsAnauMXdpN6cl5mLqwybp9yc5l6YzVWbuoCLt36YuMXdpN6cl5mLqwicr9ybj9yc5l6YzVWbuoCLwpmLvNmLzVXajNXZt9iKs46bj9idlRWe4l6YlBXYydmLqwibj9SbvNmL9RXajVGchJ7ZuoCLt36YukHdpNWZwFmcn9iKsI7au26YukHdpNWZwFmcn9iKsAnau26YukHdpNWZwFmcn9iKiojIz5GRiwiIzx6bvRlclB7bsVmdlRkI0ISYONkIsUWdyRnOik6YBJCLlVnc4pjIsZXRiwiIyEDO9gTM4gjM6kDO5UzMiojIklkIs4XXiQnchh6QhRXYEJCLiQXZlh6U4RnbhdkIsIibvlGdhJ7biFGbs36QiwiIJFkIsICdlVGaTRncvBXZSJCLiUGbgFIV";


let spread = new GC.Spread.Sheets.Workbook("ss")
let sheet = spread.getActiveSheet();

let oldGetEditorValue = GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue;
GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue = function () {
    let val = oldGetEditorValue.apply(this, arguments);
    console.log("oldVal:" + val);
    //the customer could judge thte val, and do precision process for the string number.
    if (val && !isNaN(val)) {
        let digits = Math.pow(10, 14 - Math.floor(Math.log10(parseFloat(val))));
        val = Math.floor((parseFloat(val) + Number.EPSILON) * digits) / digits + "";
        console.log("newVal:" + val);
    }
    return val;
}
