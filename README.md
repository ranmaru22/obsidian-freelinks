# Obsidian Freelinks Plugin

This is a plugin for Obsidian that aims to implement automatic linking as known
from apps like DevonThink or VoodooPad. In short, it will look through your
files for unlinked mentions of other files and create links from them.

https://github.com/ranmaru22/obsidian-freelinks/assets/16521734/caeb1743-f482-4afa-b382-7d593bfb63d9

Optionally, it can also remove links to non-existing pages.

Because this is fairly expensive computationally, the parsing will only be done
on opening the file and on any change operation, i.e. saving or stopping typing
for a few seconds.

I have tested this with a vault containing 10,000 files, and parsing that takes
around 120 ms before you see the changes. So it's not super fast, but for most
vaults it should be fast enough. The operations themselves are asynchronous, so
it won't block Obsidian. However, with very large vaults there might be
processing errors every now and then, so be warned.
