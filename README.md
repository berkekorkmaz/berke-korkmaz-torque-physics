# Seesaw Physics Simulator

A web application that demonstrates how a seesaw works. Users can place weights on a virtual seesaw and observe how it tilts based on the weight and position of objects.

## What This Application Does

This simulator shows the physics principle behind a seesaw: the board tilts toward the side with more "torque." Torque is calculated by multiplying the weight of an object by its distance from the center point (the fulcrum).

For example:
- A 2 kg weight placed far from the center produces more torque than a 2 kg weight placed near the center.
- A 10 kg weight near the center might balance a 5 kg weight placed farther away.

## How to Use

1. **Select a weight** — Use the panel on the left side to choose a weight (1 kg, 2 kg, 5 kg, or 10 kg).
2. **Place the weight** — Click anywhere on the wooden board to place the selected weight at that position.
3. **Remove a weight** — Click on any placed weight to remove it from the board.
4. **View torque values** — The display on the right side shows the total torque for the left and right sides of the seesaw.
5. **Reset** — Click the "Reset All" button to remove all weights and start over.

The seesaw will tilt based on which side has greater torque. When both sides have equal torque, the seesaw remains level.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The structure of the page |
| `style.css` | The visual appearance |
| `script.js` | The interactive behaviour and physics calculations |

## How to Run

Open the `index.html` file in a web browser. No installation or server is required.

## Notes

- The application saves placed weights automatically. When you reopen the page, your previous arrangement will be restored.
- The maximum tilt angle is 30 degrees in either direction.

