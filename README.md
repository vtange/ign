# Dear IGN,

Greetings, IGN! I'm Victor Tang and I would love to practice Code-Foo with you this summer and beyond!

I'm the kind of dude who enjoys thinking games. Strategy games, Modern and Tactical RPGs, citybuilders, and pretty much anything that lets me customize things to oblivion. My thesis project for architecture school was hailed by my colleagues as "Simcity in real-life."

Programming is in my opinion also a thinking man's game. I started working with code since I started modding video games like Civilization IV through its SDK. That was 8th grade; today I get kicks out of making cool algorithms or apps.

Where do I go first to look for new and upcoming strategy games? IGN. You guys have the best name; it's so short and simple to remember (and the red theme of your site is memorable)! In fact, I found out about Code-foo while I was just scrolling around in IGN looking for new stuff to hype about. 

At IGN, I don't want to just learn, I want to collaborate! I've mentored others during my coding bootcamp days, and it's always a pleasure to do so. After all, teaching others is great way to learn itself!


# How many LEGO bricks would it take to rebuild the Golden Gate Bridge?

Step 1: 'I'm pretty sure someone on Earth has answered this question before.'
Well, I know Legoland had a mock up of San Francisco, and the bridge isn't exactly something no one would think about building with LEGO. A quick Google search reveals not only Legoland's replica of the Golden Gate, but one made by Arlington Heights' Adam Reed Tucker. Adam's replica is definitely larger and more dimensionally accurate than the one at Legoland. According to an article written about it, it took around 64,500 LEGO pieces and 260 hours to build, is 60 feet in length and takes 60 pounds of legos to anchor itself on the ground for structural stability.

It is currently on display at the Museum of Science and Industry at Chicago and will be there until 2017.
You can find more info about that here: https://www.dnainfo.com/chicago/20160310/hyde-park/64k-legos-used-build-golden-gate-bridge-now-at-science-industry-museum

Step 2: Scale from what we found above.
Adam's bridge is 60 feet long and obviously the real Golden Gate isn't 60 feet long. If we really wanted to get a number for a bridge of similar scale of the real Golden Gate, we could scale up Adam's bridge, taking it from 60 feet to 8,981 feet. Let's to the math:

```
8,981 / 60 = The real Golden Gate is 149.6833 times longer than Adam's bridge.
Assuming Adam's bridge is proportionally similar to the real Golden Gate, we should be able to scale its length and end up with an accurate bridge in height and width as well.
Adam's bridge took 64,500 pieces, so it would take (64,500 * 149.6833), or 9,654,575 pieces to build what Adam made at the scale of the real Golden Gate.

```
Of course, if we scaled it this way, the bridge was not only be 'pixelated' or 'blocky' like a linearly-scaled raster image, we can pretty much be sure this bridge couldn't stand on its own. I know I wouldn't stand on a bridge of that scale made out of LEGO plastic! The wind, tension and compression forces would already test if not overcome the plastic bridge's limits!

If I had to do it all myself, I'd divide the bridge into 4 regions:
1. The towers
2. The road (which is not flat, it's actually a truss which has a thickness)
3. The vertical suspension cables
4. The curving, large suspension cable.

Then, I'd work out the pieces I'd need to build each part. The towers should be the easiest since they can stand on their own and don't involve a lot of cantilevering. After that I'd work on the road, which could really just be a truss laid out on the ground at the length of the Golden Gate. Ideally I would figure out a way to make it so that the road had places where the suspension cables can latch on and also connect with the two towers.

Things get tricky once we get to the cables; If we want the bridge to stand, we'd need the cables to not be made of pieces connected vertically. Instead, we'd need pieces that allow of connecting side to side so we can have the LEGO bricks pull each other as opposed to traditional compression (which we can do on the two towers). Once we know what pieces we're using, we can just use data on the length of the cables on the Golden Gate to calculate how many pieces we'd need per cable.