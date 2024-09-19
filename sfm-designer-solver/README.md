# SFM Interferometer Designer Solver

This is a solver used to generate the interferometer configurations for the app.
Finding solutions is computationally hard, so these are pregenerated using an
efficient Rust program.

The solutions are generated in a format that can simply be pasted into the
[Configuration.jsx](../src/model/Configuration.jsx). To generate the solutions,
run

```sh
cargo run --release
```

using the `--release` flag is recommended since it is over 10 times faster
than debug mode.
