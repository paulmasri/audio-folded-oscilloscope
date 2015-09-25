# audio-folded-oscilloscope
Using the Web Audio API for live audio input, this plots the waveform on the HTML canvas with the audio value on the x-axis and a time-shifted version on the y-axis.

## Future code aims:
- disable auto-gain control
- normalise size of folded-audio shape
- colour code waveform based on volume
- make newest bit of waveform be at the front (it already is) and strongest in colour with older bits faded
- look at auto-adaptive time offset based on waveform period (for pitched) or spectral density (for non periodic)
