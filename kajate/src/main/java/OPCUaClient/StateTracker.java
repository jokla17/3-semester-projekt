package OPCUaClient;

import java.time.Duration;
import java.time.LocalTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

public class StateTracker {
    private Map<Integer, String> stateTypes;
    private Map<String, HashMap<String, String>> stateTimers;
    private DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm:ss");  
    private LocalTime stateActivated;

    public StateTracker() {
        stateTypes = new HashMap<Integer, String>() {{
            put(0, "Deactivated"); put(1, "Clearing"); put(2, "Stopped"); put(3, "Starting"); put(4, "Idle");
            put(5, "Suspended"); put(6, "Execute"); put(7, "Stopping"); put(8, "Aborting"); put(9, "Aborted");
            put(10, "Holding"); put(11, "Held"); put(15, "Resetting"); put(16, "Completing"); put(17, "Complete");
            put(18, "Deactivating"); put(19, "Activating"); 
        }};
        stateTimers = new HashMap<>();
    }

    public Map<String, HashMap<String, String>> trackStates(int state) {
        if (!stateTimers.containsKey(stateTypes.get(state))) {
            stateActivated = LocalTime.now();
        }

        Duration duration = Duration.between(stateActivated, LocalTime.now());
        
        stateTimers.put(stateTypes.get(state), new HashMap<String,String>());
        stateTimers.get(stateTypes.get(state)).put("Activated", dtf.format(stateActivated));
        stateTimers.get(stateTypes.get(state)).put("Ended", dtf.format(LocalTime.now()));
        stateTimers.get(stateTypes.get(state)).put("TimeInState", "" + duration.toSeconds() + "");
        
        return stateTimers;
    }
}
