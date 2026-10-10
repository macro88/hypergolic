require 'tmpdir'
require 'fileutils'
root = File.expand_path('../../..', __dir__)
require File.join(root, 'modules/napplet-host/ios/NativeDependencyNotices')
source = File.join(root, 'modules/napplet-host/ios/Resources/notices')
HypergolicNativeDependencyNotices.verify(source, root)
cases = ['current original notices pass']
Dir.mktmpdir('hypergolic-native-notices-') do |directory|
  FileUtils.cp_r(File.join(source, '.'), directory)
  file = File.join(directory, 'libdav1d-COPYING.txt')
  original = File.binread(file)
  File.binwrite(file, original.sub('VideoLAN', 'Changed!'))
  begin
    HypergolicNativeDependencyNotices.verify(directory)
    raise 'Changed attribution was admitted'
  rescue RuntimeError => error
    raise unless error.message.include?('Native notice bytes changed')
  end
  cases << 'same-length attribution change rejects'
  File.binwrite(file, original)
  File.delete(File.join(directory, 'libdav1d-PATENTS.txt'))
  begin
    HypergolicNativeDependencyNotices.verify(directory)
    raise 'Missing patent notice was admitted'
  rescue RuntimeError => error
    raise unless error.message.include?('Native notice files changed')
  end
  cases << 'missing patent original rejects'
  FileUtils.cp(File.join(source, 'libdav1d-PATENTS.txt'), directory)
  # Keep dependency fixtures outside the resource directory's complete file set.
  Dir.mktmpdir('hypergolic-notice-dependencies-') do |fixture|
    inputs = JSON.parse(File.binread(File.join(directory, 'manifest.json'))).fetch('mainJavaScriptProfile').fetch('dependencyInputs')
    inputs.each_key do |name|
      target = File.join(fixture, name)
      FileUtils.mkdir_p(File.dirname(target))
      FileUtils.cp(File.join(root, name), target)
    end
    HypergolicNativeDependencyNotices.verify(directory, fixture)
    File.open(File.join(fixture, 'package.json'), 'a') { |file| file.write("\n") }
    begin
      HypergolicNativeDependencyNotices.verify(directory, fixture)
      raise 'Stale dependency metadata was admitted'
    rescue RuntimeError => error
      raise unless error.message.include?('Native notice dependency inputs changed')
    end
    cases << 'changed dependency metadata rejects stale notice profile'
  end
end
puts JSON.generate({ status: 'passed', cases: cases, temporaryFixturesRemoved: true })
