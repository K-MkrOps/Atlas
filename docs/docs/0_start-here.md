## Architecture Overview

This repository serves a few functions. 

### Atlas
Primarily, it acts a full stack deployment environment. The engine itself is the 
heart of Atlas, using libraries such as [threejs](https://threejs.org/), 
[bitecs](https://github.com/NateTheGreatt/bitECS), [ethereal](https://github.com/aelatgt/ethereal), 
[PhysX](https://github.com/NVIDIAGameWorks/PhysX) and 
[Mediasoup WebRTC](https://github.com/versatica/mediasoup) to enables robust MMO 
XR experience that rivals AAA quality and speed.

### Editor
The editor sits on top of the engine, as a heavily modified version of 
[Mozilla Hubs' Spoke editor](https://hubs.mozilla.com/spoke). We are right in 
the middle of a comprehensive refactor of the editor to integrate it fully with 
the engine to enable immersive scene manipulation in real time.

### Cloud Infrastructure
Atlas is a fully featured fullstack deployment using kubernetes, docker, 
agones & feathers. It enables a fully customisable website once deployed without 
changing any of the base repository code.

A long term goal of this project is a peer2peer and self-hosted layer.
In the mean time, support for the AWS cloud is provided, and other clouds can be integrated relatively easily
