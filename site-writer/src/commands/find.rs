
pub fn find<'a>(channel: &'a Channel, title: String) -> Option<&'a Item> {
    let item = channel.items().iter().find(|i| i.title().unwrap() == title);

    dbg!(item);

    Ok(item)
}
